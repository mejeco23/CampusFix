<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CampusFacilitySeeder extends Seeder
{
    private const BUILDINGS = ['Founder Building', 'Arlegui Building', 'Casal Building'];

    private const CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'IT Equipment', 'Cleaning', 'Other'];

    public function run(): void
    {
        foreach (self::CATEGORIES as $name) {
            Category::firstOrCreate(['name' => $name]);
        }

        foreach (self::BUILDINGS as $name) {
            $building = Building::firstOrCreate(['name' => $name]);
            $existingRooms = $building->rooms()->pluck('room_number')->all();

            for ($floor = 1; $floor <= 7; $floor++) {
                $floorPattern = '/^'.$floor.'\d{2}$/D';
                $hasFloorRoom = collect($existingRooms)->contains(
                    fn (string $roomNumber) => preg_match($floorPattern, $roomNumber) === 1
                );

                if ($hasFloorRoom) {
                    continue;
                }

                do {
                    $roomNumber = $floor.sprintf('%02d', random_int(1, 30));
                } while (in_array($roomNumber, $existingRooms, true));

                $building->rooms()->create(['room_number' => $roomNumber]);
                $existingRooms[] = $roomNumber;
            }
        }
    }
}
