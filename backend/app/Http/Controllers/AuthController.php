<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
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

        if ($user->role !== 'admin' && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'code' => 'email_not_verified',
                'message' => 'Please verify your email address before signing in.',
            ], 403);
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
        $verificationEmailStatus = 'sent';

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            report($e);
            $verificationEmailStatus = 'failed';
        }

        $message = match ($verificationEmailStatus) {
            'failed' => 'Your account was created, but we could not send the verification email. Please try again later using Resend Verification Email on the login page.',
            default => 'Your account was created. Check your email for the verification link before logging in.',
        };

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'profile_photo_path']) + ['profile_photo_url' => $user->profile_photo_url],
            'verification_email_status' => $verificationEmailStatus,
            'message' => $message,
        ], 201);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'code' => 'email_not_verified',
                'message' => 'Verify your email before requesting a password reset.',
            ], 403);
        }

        // Keep the response generic for privacy.
        if (! $user) {
            return response()->json([
                'message' => 'If that email is registered, a password reset link has been sent.',
            ]);
        }

        try {
            Password::sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'We could not send the email right now. Please try again later.',
            ], 500);
        }

        return response()->json([
            'message' => 'If that email is registered, a password reset link has been sent.',
        ]);
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();
        if ($user && ! $user->hasVerifiedEmail()) {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                report($e);

                return response()->json(['message' => 'We could not send the email right now. Please try again later.'], 500);
            }
        }

        return response()->json(['message' => 'If that account needs verification, a new link has been sent.']);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $frontend = rtrim(config('app.frontend_url'), '/');
        $user = User::find($id);

        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect($frontend.'/login?verified=invalid');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect($frontend.'/login?verified=1');
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if ($user && ! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages(['email' => 'Verify your email before resetting your password.']);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete();
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => 'This reset link is invalid or has expired.']);
        }

        return response()->json(['message' => 'Password has been reset. You can now log in.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
