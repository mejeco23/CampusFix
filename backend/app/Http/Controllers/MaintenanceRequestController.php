<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use App\Models\Building;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MaintenanceRequestController extends Controller
{
    public function dashboard(Request $request)
    {
        $userRequests = $this->requestsFor($request->user());
        $requests = (clone $userRequests)->with('user:id,name,email')->latest()->take(4)->get();
        $stats = [
            'total' => (clone $userRequests)->count(),
            'pending' => (clone $userRequests)->where('status', 'pending')->count(),
            'in_progress' => (clone $userRequests)->where('status', 'in_progress')->count(),
            'completed' => (clone $userRequests)->where('status', 'completed')->count(),
            'high_priority_open' => (clone $userRequests)->where('priority', 'high')->where('status', '!=', 'completed')->count(),
        ];
        $urgentRequests = (clone $userRequests)
            ->with('user:id,name,email')
            ->where('priority', 'high')
            ->where('status', '!=', 'completed')
            ->latest()
            ->take(5)
            ->get();
        $categories = (clone $userRequests)
            ->select('category')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'requests' => $requests,
            'urgent_requests' => $urgentRequests,
            'stats' => $stats,
            'categories' => $categories,
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'in:pending,in_progress,completed'],
            'priority' => ['nullable', 'in:low,medium,high'],
        ]);
        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $query = $this->requestsFor($request->user())
            ->with('user:id,name,email')
            ->latest();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn (Builder $builder) => $builder
                ->where('title', 'like', "%{$search}%")
                ->orWhere('id', ltrim($search, '#')));
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        $requests = $query->paginate($perPage);

        return response()->json($requests);
    }

    public function updateStatus(Request $request, MaintenanceRequest $maintenanceRequest): JsonResponse
    {
        $role = $request->user()->role;
        abort_unless(in_array($role, ['admin', 'maintenance'], true), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in($role === 'admin' ? ['in_progress'] : ['completed'])],
        ]);

        $allowedCurrentStatus = $role === 'admin' ? 'pending' : 'in_progress';
        $updated = DB::transaction(function () use ($maintenanceRequest, $validated, $allowedCurrentStatus): bool {
            $lockedRequest = MaintenanceRequest::query()
                ->whereKey($maintenanceRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedRequest->status !== $allowedCurrentStatus) {
                return false;
            }

            $lockedRequest->update(['status' => $validated['status']]);
            $maintenanceRequest->refresh();

            return true;
        });

        if (! $updated) {
            throw ValidationException::withMessages([
                'status' => $role === 'admin'
                    ? 'Only pending requests can be verified.'
                    : 'Only in-progress requests can be marked completed.',
            ]);
        }

        return response()->json([
            'message' => 'Request status updated.',
            'request' => $maintenanceRequest->load('user:id,name,email'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $buildingId = Building::where('name', $request->input('building'))->value('id');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'exists:categories,name'],
            'building' => ['required', 'string', Rule::exists('buildings', 'name')],
            'room' => ['required', 'string', Rule::exists('rooms', 'room_number')->where('building_id', $buildingId)],
            'priority' => ['required', 'in:low,medium,high'],
            'description' => ['required', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('maintenance-requests', 'public');
        }

        unset($validated['photo']);

        $maintenanceRequest = $request->user()->maintenanceRequests()->create($validated);

        return response()->json([
            'message' => 'Your maintenance request has been submitted.',
            'request' => $maintenanceRequest->load('user:id,name,email'),
        ], 201);
    }

    private function requestsFor(User $user): Builder
    {
        $query = MaintenanceRequest::query();

        if (! in_array($user->role, ['admin', 'maintenance'], true)) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }
}