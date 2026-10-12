<?php

namespace App\Providers;

use App\Domains\Clients\Models\Client;
use App\Policies\ClientPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // GATES
        Gate::policy(Client::class, ClientPolicy::class);
    }
}
