<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\BrevoResetPassword;
use App\Notifications\BrevoVerifyEmail;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_an_account_that_can_log_in_separately(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => 'no-reply@example.test',
            'mail.from.name' => 'CampusFix',
        ]);
        Http::fake([
            'https://api.brevo.com/v3/smtp/email' => Http::response([], 201),
        ]);

        $registration = $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ]);

        $registration->assertCreated()
            ->assertJsonPath('user.name', 'Campus Student')
            ->assertJsonPath('verification_email_status', 'sent')
            ->assertJsonPath('message', 'Your account was created. Check your email for the verification link before logging in.')
            ->assertJsonStructure(['user' => ['id', 'name', 'email']])
            ->assertJsonMissingPath('token');

        $user = User::where('email', 'student@example.test')->firstOrFail();
        $this->getJson('/api/user')->assertUnauthorized();

        $this->postJson('/api/login', [
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
        ])->assertForbidden()->assertJsonPath('code', 'email_not_verified');

        $verificationUrl = URL::temporarySignedRoute('verification.verify', now()->addHour(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($verificationUrl)->assertRedirect('http://127.0.0.1:5173/login?verified=1');
        $this->assertNotNull($user->fresh()->email_verified_at);

        $login = $this->postJson('/api/login', [
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
        ]);

        $login->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->withToken($login->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'student@example.test');

        $this->withToken($login->json('token'))
            ->patchJson('/api/user', [
                'name' => 'Campus Student Updated',
                'email' => 'student.updated@example.test',
            ])
            ->assertOk()
            ->assertJsonPath('name', 'Campus Student Updated')
            ->assertJsonPath('email', 'student.updated@example.test');

        Http::assertSent(function (ClientRequest $request) use ($user): bool {
            $payload = $request->data();
            $html = $payload['htmlContent'] ?? '';
            $text = $payload['textContent'] ?? '';

            if (! $request->hasHeader('api-key', 'test-brevo-key')
                || ($payload['to'][0]['email'] ?? null) !== $user->email
                || ! preg_match('/href="([^"]+)"/', $html, $matches)
                || ! preg_match('/https?:\/\/\S+/', $text, $textMatches)) {
                return false;
            }

            $verificationUrl = html_entity_decode($matches[1], ENT_QUOTES);
            $plainTextVerificationUrl = $textMatches[0];

            return URL::hasValidSignature(HttpRequest::create($verificationUrl))
                && URL::hasValidSignature(HttpRequest::create($plainTextVerificationUrl));
        });
    }

    public function test_registration_reports_brevo_delivery_failure(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => 'no-reply@example.test',
        ]);
        Http::fake([
            'https://api.brevo.com/v3/smtp/email' => Http::response([], 401),
        ]);

        $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ])
            ->assertCreated()
            ->assertJsonPath('verification_email_status', 'failed')
            ->assertJsonPath('message', 'Your account was created, but we could not send the verification email. Please try again later using Resend Verification Email on the login page.');
    }

    public function test_registration_reports_missing_brevo_sender_configuration(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => null,
        ]);
        Http::fake();

        $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ])
            ->assertCreated()
            ->assertJsonPath('verification_email_status', 'failed');

        Http::assertNothingSent();
    }

    public function test_profile_photo_can_be_uploaded(): void
    {
        Storage::fake('public');

        $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ]);

        User::where('email', 'student@example.test')->update(['email_verified_at' => now()]);

        $login = $this->postJson('/api/login', [
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
        ]);

        $response = $this->withToken($login->json('token'))
            ->patchJson('/api/user', [
                'name' => 'Campus Student',
                'email' => 'student@example.test',
                'photo' => UploadedFile::fake()->create('profile.png', 100, 'image/png'),
            ]);

        $response->assertOk()
            ->assertJsonPath('profile_photo_path', fn ($value) => is_string($value) && str_contains($value, 'profile-photos'));

        Storage::disk('public')->assertExists($response->json('profile_photo_path'));
    }

    public function test_students_and_maintenance_staff_can_register_and_login_as_their_role(): void
    {
        foreach (['student', 'maintenance'] as $role) {
            $email = $role.'@campusfix.test';
            $registration = $this->postJson('/api/register', [
                'name' => ucfirst($role),
                'email' => $email,
                'password' => 'campus-pass-123',
                'password_confirmation' => 'campus-pass-123',
                'role' => $role,
            ]);

            $registration->assertCreated()->assertJsonPath('user.role', $role);
            User::where('email', $email)->update(['email_verified_at' => now()]);

            $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'campus-pass-123',
            ])->assertOk()->assertJsonPath('user.role', $role);
        }
    }

    public function test_public_registration_cannot_create_an_admin(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Campus Admin',
            'email' => 'admin@campusfix.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
            'role' => 'admin',
        ])->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_unverified_user_can_resend_verification_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, BrevoVerifyEmail::class);
    }

    public function test_verified_user_does_not_receive_a_verification_email(): void
    {
        Http::fake();
        $user = User::factory()->create();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertOk();

        Http::assertNothingSent();
    }

    public function test_verified_user_can_request_a_password_reset_email(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, BrevoResetPassword::class);
    }

    public function test_password_reset_email_uses_brevo_and_laravels_password_broker_token(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => 'no-reply@example.test',
            'mail.from.name' => 'CampusFix',
            'app.frontend_url' => 'https://campusfix.example.test',
        ]);
        Http::fake([
            'https://api.brevo.com/v3/smtp/email' => Http::response([], 201),
        ]);
        Event::fake([PasswordReset::class]);
        $user = User::factory()->create(['name' => 'Password Tester']);
        $user->createToken('revoke-after-password-reset');

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If that email is registered, a password reset link has been sent.');

        $resetToken = null;
        Http::assertSent(function (ClientRequest $request) use ($user, &$resetToken): bool {
            $payload = $request->data();
            $html = $payload['htmlContent'] ?? '';

            if (! $request->hasHeader('api-key', 'test-brevo-key')
                || ($payload['to'][0]['email'] ?? null) !== $user->email
                || ! preg_match('/href="([^"]+)"/', $html, $matches)) {
                return false;
            }

            $resetUrl = html_entity_decode($matches[1], ENT_QUOTES);
            parse_str((string) parse_url($resetUrl, PHP_URL_QUERY), $query);
            $resetToken = $query['token'] ?? null;

            return str_starts_with($resetUrl, 'https://campusfix.example.test/reset-password?token=')
                && ($query['email'] ?? null) === $user->email;
        });

        $this->postJson('/api/reset-password', [
            'token' => $resetToken,
            'email' => $user->email,
            'password' => 'new-campus-pass-123',
            'password_confirmation' => 'new-campus-pass-123',
        ])->assertOk()
            ->assertJsonPath('message', 'Password has been reset. You can now log in.');

        $this->assertTrue(Hash::check('new-campus-pass-123', $user->fresh()->password));
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'revoke-after-password-reset',
        ]);
        Event::assertDispatched(PasswordReset::class);
    }

    public function test_unverified_user_cannot_request_a_password_reset_email(): void
    {
        Http::fake();
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertForbidden()
            ->assertJsonPath('code', 'email_not_verified');

        Http::assertNothingSent();
    }

    public function test_unknown_email_keeps_generic_password_reset_response_without_sending_email(): void
    {
        Http::fake();

        $this->postJson('/api/forgot-password', ['email' => 'unknown@example.test'])
            ->assertOk()
            ->assertJsonPath('message', 'If that email is registered, a password reset link has been sent.');

        Http::assertNothingSent();
    }

    public function test_brevo_password_reset_failure_returns_a_friendly_error(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => 'no-reply@example.test',
        ]);
        Http::fake([
            'https://api.brevo.com/v3/smtp/email' => Http::response([], 401),
        ]);

        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertInternalServerError()
            ->assertJsonPath('message', 'We could not send the email right now. Please try again later.');
    }

    public function test_changing_email_requires_verification_again(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'old@example.test']);

        $this->withToken($user->createToken('profile-test')->plainTextToken)
            ->patchJson('/api/user', [
                'name' => $user->name,
                'email' => 'new@example.test',
            ])
            ->assertOk()
            ->assertJsonPath('email', 'new@example.test');

        $updatedUser = $user->fresh();
        $this->assertNull($updatedUser->email_verified_at);
        Notification::assertSentTo($updatedUser, BrevoVerifyEmail::class);
    }

    public function test_unverified_provisioned_admin_can_log_in(): void
    {
        User::factory()->unverified()->create([
            'name' => 'Campus Admin',
            'email' => 'admin@campusfix.test',
            'password' => 'campus-pass-123',
            'role' => 'admin',
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@campusfix.test',
            'password' => 'campus-pass-123',
        ])->assertOk()->assertJsonPath('user.role', 'admin');
    }

    public function test_students_only_see_their_own_requests(): void
    {
        $student = User::factory()->create(['name' => 'Requesting Student']);
        $otherStudent = User::factory()->create(['name' => 'Other Student']);

        $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));
        $otherStudent->maintenanceRequests()->create($this->requestAttributes('Leaking sink'));

        $response = $this->withToken($student->createToken('student-test')->plainTextToken)
            ->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Broken light')
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.0.description', 'Needs maintenance attention.');
    }

    public function test_admin_can_see_all_student_requests(): void
    {
        $student = User::factory()->create(['name' => 'Requesting Student']);
        $otherStudent = User::factory()->create(['name' => 'Other Student']);
        $admin = User::factory()->create(['role' => 'admin']);

        $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));
        $otherStudent->maintenanceRequests()->create($this->requestAttributes('Leaking sink'));

        $response = $this->withToken($admin->createToken('admin-test')->plainTextToken)
            ->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Other Student'])
            ->assertJsonFragment(['name' => 'Requesting Student']);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.total', 2)
            ->assertJsonCount(2, 'requests');
    }

    public function test_maintenance_staff_can_review_campus_requests_and_update_status(): void
    {
        Storage::fake('public');
        $student = User::factory()->create(['name' => 'Requesting Student']);
        $otherStudent = User::factory()->create(['name' => 'Other Student']);
        $maintenance = User::factory()->create(['role' => 'maintenance']);
        $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));
        $photoPath = 'maintenance-requests/leaking-sink.jpg';
        Storage::disk('public')->put($photoPath, 'test image');
        $otherStudent->maintenanceRequests()->create(array_merge(
            $this->requestAttributes('Leaking sink'),
            ['priority' => 'high', 'photo_path' => $photoPath],
        ));

        $this->withToken($maintenance->createToken('maintenance-test')->plainTextToken)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.total', 2)
            ->assertJsonPath('stats.high_priority_open', 1)
            ->assertJsonCount(1, 'urgent_requests');

        $this->getJson('/api/requests?search=Leaking&priority=high')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user.name', 'Other Student')
            ->assertJsonPath('data.0.description', 'Needs maintenance attention.')
            ->assertJsonPath('data.0.photo_url', Storage::disk('public')->url($photoPath));

        $requestId = $student->maintenanceRequests()->where('title', 'Broken light')->value('id');
        $this->patchJson('/api/requests/'.$requestId, ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('request.status', 'in_progress');

        $this->withToken($student->createToken('student-status-test')->plainTextToken)
            ->getJson('/api/requests')
            ->assertOk()
            ->assertJsonPath('data.0.status', 'in_progress');
    }

    public function test_students_cannot_update_request_status(): void
    {
        $student = User::factory()->create();
        $maintenanceRequest = $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));

        $this->withToken($student->createToken('student-test')->plainTextToken)
            ->patchJson('/api/requests/'.$maintenanceRequest->id, ['status' => 'completed'])
            ->assertForbidden();
    }

    public function test_admin_can_update_request_status(): void
    {
        $student = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $maintenanceRequest = $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));

        $this->withToken($admin->createToken('admin-test')->plainTextToken)
            ->patchJson('/api/requests/'.$maintenanceRequest->id, ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('request.status', 'in_progress');

        $this->assertDatabaseHas('maintenance_requests', [
            'id' => $maintenanceRequest->id,
            'status' => 'in_progress',
        ]);
    }

    private function requestAttributes(string $title): array
    {
        return [
            'title' => $title,
            'category' => 'Electrical',
            'building' => 'Science Hall',
            'room' => '204',
            'priority' => 'medium',
            'description' => 'Needs maintenance attention.',
        ];
    }
}
