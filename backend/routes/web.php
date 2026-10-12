<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'CampusFix API',
        'status' => 'ok',
    ]);
});
