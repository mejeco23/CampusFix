<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampusFixFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_register_and_reach_the_dashboard(): void
    {
        $this->get('/login')->assertOk();

        $this->post('/register', [
            'name' => 'Maya Chen',
            'email' => 'maya@example.test',
            'password' => 'campusfix-password',
            'password_confirmation' => 'campusfix-password',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
        $this->get('/dashboard')->assertOk();
    }

    public function test_an_authenticated_user_can_submit_a_maintenance_request(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/requests', [
            'title' => 'Broken air conditioner',
            'category' => 'Electrical',
            'building' => 'Science Hall',
            'room' => '204',
            'priority' => 'high',
            'description' => 'The unit is not cooling the room.',
        ])->assertRedirect(route('requests.index'));

        $this->assertDatabaseHas('maintenance_requests', [
            'user_id' => $user->id,
            'title' => 'Broken air conditioner',
            'status' => 'pending',
        ]);
    }
}