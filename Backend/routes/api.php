<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;


Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'registerUser']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {

    // ROTTE USER
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //ROTTE PER COMPANY
    Route::prefix('companies/{company:slug}')
        ->middleware('company.member')
        ->scopeBindings()
        ->group(function () {
            //ROTTE PER COMPANY
            Route::get('', [CompanyController::class, 'getCompanyData']);
            Route::put('', [CompanyController::class, 'updateCompanyData']);

            //ROTTE PER COMPNAY SETTINGS
            Route::get('settings', [CompanyController::class, 'getCompanySettings']);
            Route::put('settings', [CompanyController::class, 'updateCompanySettings']);

            // ROTTE PER CLIENTS
            Route::get('clients', [ClientController::class, 'index']);
            Route::post('clients', [ClientController::class, 'store']);
            Route::get('clients/{clientId}', [ClientController::class, 'show']);
            Route::put('clients/{clientId}', [ClientController::class, 'update']);
            Route::patch('clients/{clientId}', [ClientController::class, 'update']);
            Route::delete('clients/{clientId}', [ClientController::class, 'destroy']);

            // PRODUCTS
            Route::get('products', [ProductController::class, 'index']);
            Route::post('products', [ProductController::class, 'store']);
            Route::get('products/{productId}', [ProductController::class, 'show']);
            Route::put('products/{productId}', [ProductController::class, 'update']);
            Route::delete('products/{productId}', [ProductController::class, 'destroy']);
        });




    // Clients



});
