<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = env('CAMPUSFIX_SUPER_ADMIN_NAME', 'Campus Fix Admin');
        $email = env('CAMPUSFIX_SUPER_ADMIN_EMAIL');
        $password = env('CAMPUSFIX_SUPER_ADMIN_PASSWORD');

        if (! $name || ! $email || ! $password) {
            $this->command?->warn('Super admin was not seeded. Set CAMPUSFIX_SUPER_ADMIN_EMAIL and CAMPUSFIX_SUPER_ADMIN_PASSWORD first.');

            return;
        }

        if (strlen($password) < 8) {
            throw new RuntimeException('CAMPUSFIX_SUPER_ADMIN_PASSWORD must contain at least 8 characters.');
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->role = 'admin';
        $user->email_verified_at ??= now();

        if (! $user->exists) {
            $user->password = Hash::make($password);
        }

        $user->save();
    }
}