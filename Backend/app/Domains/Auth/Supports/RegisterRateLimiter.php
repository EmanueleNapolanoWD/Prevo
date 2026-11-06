<?php

namespace App\Domains\Auth\Supports;

use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RegisterRateLimiter
{
    private const MAX_ATTEMPTS_PER_IP = 5; // Max 5 tentativi di registrazione
    private const DECAY_SECONDS = 900;     // Finestra di 15 minuti

    public function ensureNotLocked(Request $request): void
    {
        $key = 'register:ip:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS_PER_IP)) {
            $seconds = RateLimiter::availableIn($key);

            throw new ThrottleRequestsException(
                'Troppi tentativi di registrazione da questo indirizzo IP. Riprova più tardi.',
                null,
                ['Retry-After' => $seconds],
            );
        }
    }

    public function hit(Request $request): void
    {
        $key = 'register:ip:' . $request->ip();
        RateLimiter::hit($key, self::DECAY_SECONDS);
    }
}