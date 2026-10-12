<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
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

    // Clients
    Route::get('/companies/{companyId}/clients', [ClientController::class, 'index']);
    Route::get('/companies/{companyId}/clients/{clientId}', [ClientController::class, 'show']);
    Route::put('/companies/{companyId}/clients/{clientId}', [ClientController::class, 'update']);
    Route::patch('/companies/{companyId}/clients/{clientId}', [ClientController::class, 'update']);
    Route::delete('/companies/{companyId}/clients/{clientId}', [ClientController::class, 'destroy']);
});
