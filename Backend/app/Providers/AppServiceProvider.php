<?php

namespace App\Providers;

use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use App\Domains\Quotes\Models\Quote;
use App\Policies\ClientPolicy;
use App\Policies\CompanyPolicy;
use App\Policies\ProductPolicy;
use App\Policies\QuotePolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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

        // Politica password unica per tutta l'app
        Password::defaults(fn() => app()->isProduction()
            ? Password::min(12)->mixedCase()->numbers()->symbols()->uncompromised()
            : Password::min(8));

        // Override del link di reset password per il frontend
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url')
                . '/reset-password?token=' . $token . '&email=' . $user->getEmailForPasswordReset();
        });

        /*
         ======================> GATES
        */
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Company::class, CompanyPolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Quote::class, QuotePolicy::class);

        /*
        ======================> RATE LIMITING
        */

        // limite richieste claudflare
        RateLimiter::for('cloudflare-pdf', fn () => Limit::perSecond(1, 20)); // sotto il tuo limite reale

        // Limite di richieste per il login: 10 richieste al minuto per email e IP
        RateLimiter::for('login', fn(Request $r) => Limit::perMinute(10)->by($r->email . $r->ip()));

        // Limite di richieste per la registrazione: 5 richieste al minuto per IP
        RateLimiter::for('sign-up', fn(Request $r) => [
            Limit::perHour(5)->by($r->ip()),
            Limit::perDay(20)->by($r->ip()),
        ]);
    }
}
