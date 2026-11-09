<?php

use App\Http\Controllers\Api\Ai\QuoteAiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\QuotePdfController;
use App\Http\Controllers\Api\QuoteSettingsController;
use Illuminate\Support\Facades\Route;


Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'registerUser']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware(['signed:relative', 'throttle:30,1'])->group(function () {
    // Dati per la pagina di stampa Next (JSON)
    Route::get('/companies/{company:slug}/quotes/{quoteId}/print', [QuotePdfController::class, 'printData'])
        ->name('quotes.print-data');

    // Link pubblico temporaneo (WhatsApp / mail), usato da QuotePdfService::publicUrl()
    Route::get('/public/companies/{company:slug}/quotes/{quoteId}/pdf', [QuotePdfController::class, 'publicShow'])
        ->name('quotes.public.pdf');
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

            //ROTTE PER Quote SETTINGS
            Route::get('quote-settings', [QuoteSettingsController::class, 'show']);
            Route::put('quote-settings', [QuoteSettingsController::class, 'update']);

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

            // QUOTES
            Route::get('quotes', [QuoteController::class, 'index']);
            Route::get('quotes/{quoteId}', [QuoteController::class, 'show']);
            Route::post('quotes', [QuoteController::class, 'store']);
            Route::put('quotes/{quoteId}', [QuoteController::class, 'update']);
            Route::delete('quotes/{quoteId}', [QuoteController::class, 'delete']);

            // ROTTE DASHBOARD
            Route::get('dashboard/kpis', [DashboardController::class, 'kpis']);
            Route::get('dashboard/todos', [DashboardController::class, 'todos']);
            Route::get('dashboard/recent', [DashboardController::class, 'recent']);
            Route::get('dashboard/chart', [DashboardController::class, 'chart']);
            Route::get('dashboard/insights', [DashboardController::class, 'insights']);

            // ROTTE PDF
            Route::get('quotes/{quoteId}/pdf', [QuotePdfController::class, 'show']);
            Route::get('quotes/{quoteId}/pdf/download', [QuotePdfController::class, 'download']);

            // ROTTE AI 
            Route::post('quotes/ai-draft', [QuoteAiController::class, 'draft']);

        });
});
