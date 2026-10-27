<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\CampusFacilitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CampusFixFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_register_through_the_authentication_api(): void
    {
        config([
            'services.brevo.key' => 'test-brevo-key',
            'mail.from.address' => 'no-reply@example.test',
            'mail.from.name' => 'CampusFix',
        ]);
        Http::fake([
            'https://api.brevo.com/v3/smtp/email' => Http::response([], 201),
        ]);

        $this->postJson('/api/register', [
            'name' => 'Maya Chen',
            'email' => 'maya@example.test',
            'password' => 'campusfix-password',
            'password_confirmation' => 'campusfix-password',
        ])->assertCreated()
            ->assertJsonPath('user.name', 'Maya Chen')
            ->assertJsonPath('user.email', 'maya@example.test')
            ->assertJsonPath('verification_email_status', 'sent')
            ->assertJsonPath('message', 'Your account was created. Check your email for the verification link before logging in.')
            ->assertJsonMissingPath('token');

        $this->assertDatabaseHas('users', [
            'name' => 'Maya Chen',
            'email' => 'maya@example.test',
            'email_verified_at' => null,
        ]);
    }

    public function test_an_authenticated_user_can_submit_a_maintenance_request(): void
    {
        $this->seed(CampusFacilitySeeder::class);
        $user = User::factory()->create();
        $token = $user->createToken('campusfix-test')->plainTextToken;
        $building = Building::with('rooms')->firstOrFail();
        $category = Category::firstOrFail();
        $room = $building->rooms->firstOrFail();

        $this->withToken($token)->postJson('/api/requests', [
            'title' => 'Broken air conditioner',
            'category' => $category->name,
            'building' => $building->name,
            'room' => $room->room_number,
            'priority' => 'high',
            'description' => 'The unit is not cooling the room.',
        ])->assertCreated()
            ->assertJsonPath('message', 'Your maintenance request has been submitted.')
            ->assertJsonPath('request.user_id', $user->id)
            ->assertJsonPath('request.title', 'Broken air conditioner')
            ->assertJsonPath('request.category', $category->name)
            ->assertJsonPath('request.building', $building->name)
            ->assertJsonPath('request.room', $room->room_number);

        $this->assertDatabaseHas('maintenance_requests', [
            'user_id' => $user->id,
            'title' => 'Broken air conditioner',
            'category' => $category->name,
            'building' => $building->name,
            'room' => $room->room_number,
            'status' => 'pending',
        ]);
    }
}
