<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Category;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $filters = $request->validate(['search' => ['nullable', 'string', 'max:150']]);
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at'])
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(min(max($request->integer('per_page', 100), 1), 100));

        return response()->json($users);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['student', 'maintenance', 'admin'])],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        if ($user->role === 'admin') {
            $user->forceFill(['email_verified_at' => now()])->save();
        } else {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['user' => $this->userData($user)], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['student', 'maintenance', 'admin'])],
        ]);

        if ($user->id === $request->user()->id && $validated['role'] !== 'admin') {
            return response()->json(['message' => 'You cannot remove your own admin role.'], 422);
        }

        if ($user->role === 'admin' && $validated['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['message' => 'The final admin account cannot be demoted.'], 422);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $emailChanged = $user->isDirty('email');

        if ($emailChanged || $user->role === 'admin') {
            $user->email_verified_at = $user->role === 'admin' ? ($user->email_verified_at ?? now()) : null;
        }

        $user->save();

        if ($emailChanged && $user->role !== 'admin') {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['user' => $this->userData($user)]);
    }

    public function facilities(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json($this->facilityData());
    }

    public function dashboard(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $period = $request->validate([
            'period' => ['nullable', Rule::in(['week', 'month', 'semester', 'all'])],
        ])['period'] ?? 'semester';
        $requests = $this->requestQueryForPeriod($period);
        $stats = [
            'total' => (clone $requests)->count(),
            'pending' => (clone $requests)->where('status', 'pending')->count(),
            'in_progress' => (clone $requests)->where('status', 'in_progress')->count(),
            'completed' => (clone $requests)->where('status', 'completed')->count(),
        ];
        $categories = (clone $requests)
            ->select('category')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return response()->json(compact('period', 'stats', 'categories'));
    }

    public function lookups(): JsonResponse
    {
        return response()->json($this->facilityData());
    }

    public function storeBuilding(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:buildings,name'],
            'rooms' => ['sometimes', 'array', 'max:100'],
            'rooms.*' => ['required', 'string', 'max:80'],
        ]);

        $building = DB::transaction(function () use ($validated) {
            $building = Building::create(['name' => trim($validated['name'])]);
            $roomNumbers = collect($validated['rooms'] ?? [])->map(fn ($room) => trim($room))->filter()->unique();

            foreach ($roomNumbers as $roomNumber) {
                $building->rooms()->create(['room_number' => $roomNumber]);
            }

            return $building->load('rooms');
        });

        return response()->json(['building' => $building], 201);
    }

    public function updateBuilding(Request $request, Building $building): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('buildings', 'name')->ignore($building->id)],
        ]);

        $oldName = $building->name;
        $newName = trim($validated['name']);
        DB::transaction(function () use ($building, $oldName, $newName) {
            $building->update(['name' => $newName]);
            MaintenanceRequest::where('building', $oldName)->update(['building' => $newName]);
        });

        return response()->json(['building' => $building->load('rooms')]);
    }

    public function destroyBuilding(Request $request, Building $building): JsonResponse
    {
        $this->ensureAdmin($request);

        if (MaintenanceRequest::where('building', $building->name)->exists()) {
            return response()->json(['message' => 'This building is referenced by maintenance requests and cannot be deleted.'], 409);
        }

        $building->delete();

        return response()->json(['message' => 'Building deleted.']);
    }

    public function storeRoom(Request $request, Building $building): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:80', Rule::unique('rooms', 'room_number')->where('building_id', $building->id)],
        ]);

        return response()->json([
            'room' => $building->rooms()->create(['room_number' => trim($validated['room_number'])]),
        ], 201);
    }

    public function updateRoom(Request $request, Room $room): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:80', Rule::unique('rooms', 'room_number')->where('building_id', $room->building_id)->ignore($room->id)],
        ]);

        $oldRoomNumber = $room->room_number;
        $newRoomNumber = trim($validated['room_number']);
        $buildingName = $room->building->name;
        DB::transaction(function () use ($room, $oldRoomNumber, $newRoomNumber, $buildingName) {
            $room->update(['room_number' => $newRoomNumber]);
            MaintenanceRequest::where('building', $buildingName)
                ->where('room', $oldRoomNumber)
                ->update(['room' => $newRoomNumber]);
        });

        return response()->json(['room' => $room]);
    }

    public function destroyRoom(Request $request, Room $room): JsonResponse
    {
        $this->ensureAdmin($request);
        $building = $room->building;

        if (MaintenanceRequest::where('building', $building->name)->where('room', $room->room_number)->exists()) {
            return response()->json(['message' => 'This room is referenced by maintenance requests and cannot be deleted.'], 409);
        }

        $room->delete();

        return response()->json(['message' => 'Room deleted.']);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:categories,name'],
        ]);

        return response()->json(['category' => Category::create(['name' => trim($validated['name'])])], 201);
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('categories', 'name')->ignore($category->id)],
        ]);

        $oldName = $category->name;
        $category->update(['name' => trim($validated['name'])]);
        MaintenanceRequest::where('category', $oldName)->update(['category' => $category->name]);

        return response()->json(['category' => $category]);
    }

    public function destroyCategory(Request $request, Category $category): JsonResponse
    {
        $this->ensureAdmin($request);

        if (MaintenanceRequest::where('category', $category->name)->exists()) {
            return response()->json(['message' => 'This category is used by maintenance requests and cannot be deleted.'], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    public function exportRequests(Request $request)
    {
        $this->ensureAdmin($request);
        $period = $request->validate([
            'period' => ['nullable', Rule::in(['week', 'month', 'semester', 'all'])],
        ])['period'] ?? 'semester';
        $since = $this->periodStart($period);

        return response()->streamDownload(function () use ($since) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Title', 'Student', 'Email', 'Category', 'Building', 'Room', 'Priority', 'Status', 'Submitted']);

            MaintenanceRequest::with('user:id,name,email')
                ->when($since, fn (Builder $query) => $query->where('created_at', '>=', $since))
                ->orderBy('id')
                ->chunkById(500, function ($requests) use ($handle) {
                    foreach ($requests as $item) {
                        fputcsv($handle, [
                            $item->id,
                            $item->title,
                            $item->user?->name,
                            $item->user?->email,
                            $item->category,
                            $item->building,
                            $item->room,
                            $item->priority,
                            $item->status,
                            $item->created_at?->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, 'campusfix-requests-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function facilityData(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'buildings' => Building::with(['rooms:id,building_id,room_number'])->orderBy('name')->get(['id', 'name']),
        ];
    }

    private function requestQueryForPeriod(string $period): Builder
    {
        $since = $this->periodStart($period);

        return MaintenanceRequest::query()
            ->when($since, fn (Builder $query) => $query->where('created_at', '>=', $since));
    }

    private function periodStart(string $period): ?\Illuminate\Support\Carbon
    {
        $now = now();

        return match ($period) {
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'semester' => $now->copy()->month($now->month <= 6 ? 1 : 7)->startOfMonth(),
            default => null,
        };
    }

    private function userData(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at']);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }
}