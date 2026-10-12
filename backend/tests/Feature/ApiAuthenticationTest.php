<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_issues_a_token_that_can_access_the_user_endpoint(): void
    {
        $registration = $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ]);

        $registration->assertCreated()
            ->assertJsonPath('user.name', 'Campus Student')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->withToken($registration->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'student@example.test');

        $this->withToken($registration->json('token'))
            ->patchJson('/api/user', [
                'name' => 'Campus Student Updated',
                'email' => 'student.updated@example.test',
            ])
            ->assertOk()
            ->assertJsonPath('name', 'Campus Student Updated')
            ->assertJsonPath('email', 'student.updated@example.test');
    }

    public function test_profile_photo_can_be_uploaded(): void
    {
        Storage::fake('public');

        $registration = $this->postJson('/api/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.test',
            'password' => 'campus-pass-123',
            'password_confirmation' => 'campus-pass-123',
        ]);

        $response = $this->withToken($registration->json('token'))
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

    public function test_provisioned_admin_can_log_in(): void
    {
        User::factory()->create([
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
            ->assertJsonPath('data.0.title', 'Broken light');
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
        $student = User::factory()->create(['name' => 'Requesting Student']);
        $otherStudent = User::factory()->create(['name' => 'Other Student']);
        $maintenance = User::factory()->create(['role' => 'maintenance']);
        $student->maintenanceRequests()->create($this->requestAttributes('Broken light'));
        $otherStudent->maintenanceRequests()->create(array_merge(
            $this->requestAttributes('Leaking sink'),
            ['priority' => 'high'],
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
            ->assertJsonPath('data.0.user.name', 'Other Student');

        $requestId = $otherStudent->maintenanceRequests()->where('title', 'Leaking sink')->value('id');
        $this->patchJson('/api/requests/'.$requestId, ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('request.status', 'in_progress');
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