<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,1')->post(
    '/login',
    [AuthController::class, 'login']
);

Route::middleware('throttle:5,1')->post(
    '/register',
    [AuthController::class, 'registerUser']
);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
