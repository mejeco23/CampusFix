<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Category;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\CampusFacilitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_manage_users_and_facilities(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $this->withToken($student->createToken('student-test')->plainTextToken)
            ->getJson('/api/admin/users')
            ->assertForbidden();

        $this->getJson('/api/admin/facilities')->assertForbidden();
    }

    public function test_admin_can_list_create_and_update_users(): void
    {
        Notification::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonPath('data.0.email', $admin->email);

        $created = $this->withToken($token)
            ->postJson('/api/admin/users', [
                'name' => 'Campus Maintenance',
                'email' => 'maintenance@example.test',
                'role' => 'maintenance',
                'password' => 'secure-pass-123',
                'password_confirmation' => 'secure-pass-123',
            ])
            ->assertCreated()
            ->assertJsonPath('user.role', 'maintenance');

        $userId = $created->json('user.id');
        $this->withToken($token)
            ->patchJson('/api/admin/users/'.$userId, [
                'name' => 'Facilities Team',
                'email' => 'maintenance@example.test',
                'role' => 'student',
            ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Facilities Team')
            ->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'name' => 'Facilities Team',
            'role' => 'student',
        ]);
    }

    public function test_admin_can_delete_a_user_and_their_requests_and_uploaded_photos(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['profile_photo_path' => 'profile-photos/user.png']);
        Storage::disk('public')->put('profile-photos/user.png', 'profile');
        Storage::disk('public')->put('maintenance-requests/request.png', 'request');

        $maintenanceRequest = $user->maintenanceRequests()->create([
            'title' => 'Broken light',
            'category' => 'Electrical',
            'building' => 'Science Hall',
            'room' => '204',
            'priority' => 'high',
            'description' => 'Needs repair.',
            'photo_path' => 'maintenance-requests/request.png',
        ]);
        $user->createToken('user-test');
        $adminToken = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($adminToken)
            ->deleteJson('/api/admin/users/'.$user->id)
            ->assertOk()
            ->assertJsonPath('message', 'User account and related requests deleted.')
            ->assertJsonPath('warning', null);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('maintenance_requests', ['id' => $maintenanceRequest->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
        Storage::disk('public')->assertMissing('profile-photos/user.png');
        Storage::disk('public')->assertMissing('maintenance-requests/request.png');
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson('/api/admin/users/'.$admin->id)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot delete your own account.');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_non_admins_cannot_delete_users(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $user = User::factory()->create(['role' => 'maintenance']);
        $token = $student->createToken('student-test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson('/api/admin/users/'.$user->id)
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_campus_facility_seeder_creates_seven_randomized_floor_rooms_for_each_building_idempotently(): void
    {
        $this->seed(CampusFacilitySeeder::class);

        $expectedBuildings = ['Arlegui Building', 'Casal Building', 'Founder Building'];
        $this->assertSame($expectedBuildings, Building::orderBy('name')->pluck('name')->all());

        foreach (Building::with('rooms')->get() as $building) {
            $this->assertCount(7, $building->rooms);
            $this->assertCount(
                7,
                $building->rooms->pluck('room_number')->filter(
                    fn (string $roomNumber) => preg_match('/^[1-7]\d{2}$/D', $roomNumber) === 1
                )->unique()
            );

            foreach ($building->rooms as $room) {
                $this->assertGreaterThanOrEqual(1, (int) substr($room->room_number, 1));
                $this->assertLessThanOrEqual(30, (int) substr($room->room_number, 1));
            }
        }

        $this->seed(CampusFacilitySeeder::class);
        $this->assertSame(21, Room::count());
        $this->assertSame(6, Category::count());
    }

    public function test_admin_can_manage_buildings_rooms_and_categories(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('admin-test')->plainTextToken;

        $category = $this->withToken($token)
            ->postJson('/api/admin/categories', ['name' => 'Security'])
            ->assertCreated()
            ->json('category');

        $building = $this->withToken($token)
            ->postJson('/api/admin/buildings', [
                'name' => 'North Hall',
                'rooms' => ['101', '102'],
            ])
            ->assertCreated()
            ->json('building');

        $this->withToken($token)
            ->getJson('/api/admin/facilities')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Security'])
            ->assertJsonFragment(['name' => 'North Hall'])
            ->assertJsonFragment(['room_number' => '101']);

        $this->withToken($token)
            ->patchJson('/api/admin/buildings/'.$building['id'], ['name' => 'North Campus Hall'])
            ->assertOk()
            ->assertJsonPath('building.name', 'North Campus Hall');

        $room = $building['rooms'][0];
        $this->withToken($token)
            ->patchJson('/api/admin/rooms/'.$room['id'], ['room_number' => '101A'])
            ->assertOk()
            ->assertJsonPath('room.room_number', '101A');

        $this->withToken($token)
            ->patchJson('/api/admin/categories/'.$category['id'], ['name' => 'Campus Security'])
            ->assertOk()
            ->assertJsonPath('category.name', 'Campus Security');
    }

    public function test_admin_cannot_delete_a_facility_or_category_used_by_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create();
        $category = Category::create(['name' => 'Special Category']);
        $building = Building::create(['name' => 'Science Hall']);
        $room = $building->rooms()->create(['room_number' => '204']);
        $student->maintenanceRequests()->create([
            'title' => 'Broken light',
            'category' => $category->name,
            'building' => $building->name,
            'room' => $room->room_number,
            'priority' => 'high',
            'description' => 'Needs repair.',
        ]);
        $token = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($token)->deleteJson('/api/admin/buildings/'.$building->id)->assertConflict();
        $this->withToken($token)->deleteJson('/api/admin/rooms/'.$room->id)->assertConflict();
        $this->withToken($token)->deleteJson('/api/admin/categories/'.$category->id)->assertConflict();
    }

    public function test_admin_dashboard_period_and_export_use_real_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create();
        $student->maintenanceRequests()->create([
            'title' => 'Broken light',
            'category' => 'Electrical',
            'building' => 'Science Hall',
            'room' => '204',
            'priority' => 'high',
            'description' => 'Needs repair.',
        ]);
        $token = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/admin/dashboard?period=all')
            ->assertOk()
            ->assertJsonPath('stats.total', 1)
            ->assertJsonPath('categories.0.category', 'Electrical');

        $this->withToken($token)
            ->get('/api/admin/requests/export?period=all')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
