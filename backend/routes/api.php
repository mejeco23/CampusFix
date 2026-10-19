<?php

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MaintenanceRequestController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/lookups', [AdminController::class, 'lookups']);
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::post('/admin/users', [AdminController::class, 'storeUser']);
    Route::patch('/admin/users/{user}', [AdminController::class, 'updateUser']);
    Route::get('/admin/facilities', [AdminController::class, 'facilities']);
    Route::post('/admin/buildings', [AdminController::class, 'storeBuilding']);
    Route::patch('/admin/buildings/{building}', [AdminController::class, 'updateBuilding']);
    Route::delete('/admin/buildings/{building}', [AdminController::class, 'destroyBuilding']);
    Route::post('/admin/buildings/{building}/rooms', [AdminController::class, 'storeRoom']);
    Route::patch('/admin/rooms/{room}', [AdminController::class, 'updateRoom']);
    Route::delete('/admin/rooms/{room}', [AdminController::class, 'destroyRoom']);
    Route::post('/admin/categories', [AdminController::class, 'storeCategory']);
    Route::patch('/admin/categories/{category}', [AdminController::class, 'updateCategory']);
    Route::delete('/admin/categories/{category}', [AdminController::class, 'destroyCategory']);
    Route::get('/admin/requests/export', [AdminController::class, 'exportRequests']);

    Route::get('/user', function (Request $request) {
        $user = $request->user();

        return $user->only(['id', 'name', 'email', 'role', 'profile_photo_path']) + ['profile_photo_url' => $user->profile_photo_url];
    });

    Route::patch('/user', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo_path);
            }

            $user->profile_photo_path = $request->file('photo')->store('profile-photos', 'public');
        }

        $user->save();

        if ($emailChanged) {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json($user->only(['id', 'name', 'email', 'role', 'profile_photo_path']) + ['profile_photo_url' => $user->profile_photo_url]);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [MaintenanceRequestController::class, 'dashboard']);
    Route::get('/requests', [MaintenanceRequestController::class, 'index']);
    Route::post('/requests', [MaintenanceRequestController::class, 'store']);
    Route::patch('/requests/{maintenanceRequest}', [MaintenanceRequestController::class, 'updateStatus']);
});
