<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->timestamps();
        });

        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->unique();
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->string('room_number', 80);
            $table->timestamps();
            $table->unique(['building_id', 'room_number']);
        });

        $now = now();
        $categories = collect(['Electrical', 'Plumbing', 'Furniture', 'IT Equipment', 'Cleaning', 'Other'])
            ->merge(DB::table('maintenance_requests')->whereNotNull('category')->distinct()->pluck('category'))
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->unique(fn ($name) => mb_strtolower(trim($name)))
            ->values();

        foreach ($categories as $name) {
            DB::table('categories')->insertOrIgnore([
                'name' => trim($name),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $locations = DB::table('maintenance_requests')
            ->select('building', 'room')
            ->whereNotNull('building')
            ->where('building', '<>', '')
            ->distinct()
            ->get();

        foreach ($locations as $location) {
            DB::table('buildings')->insertOrIgnore([
                'name' => trim($location->building),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $buildingId = DB::table('buildings')->where('name', trim($location->building))->value('id');
            if ($buildingId && is_string($location->room) && trim($location->room) !== '') {
                DB::table('rooms')->insertOrIgnore([
                    'building_id' => $buildingId,
                    'room_number' => trim($location->room),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('buildings');
        Schema::dropIfExists('categories');
    }
};