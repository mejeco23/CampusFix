<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('These credentials do not match our records.'),
            ]);
        }

        return response()->json([
            'token' => $user->createToken('campusfix-react')->plainTextToken,
            'user' => $user->only(['id', 'name', 'email', 'role', 'profile_photo_path']) + ['profile_photo_url' => $user->profile_photo_url],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
            'role' => ['sometimes', 'string', Rule::in(['student', 'maintenance'])],
        ]);

        $validated['role'] = $validated['role'] ?? 'student';

        $user = User::create($validated);
        return response()->json([
            'token' => $user->createToken('campusfix-react')->plainTextToken,
            'user' => $user->only(['id', 'name', 'email', 'role', 'profile_photo_path']) + ['profile_photo_url' => $user->profile_photo_url],
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}