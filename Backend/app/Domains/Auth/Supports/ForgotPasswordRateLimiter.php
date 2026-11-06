<?php

namespace App\Domains\Auth\Supports;

use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class ForgotPasswordRateLimiter
{
    private const MAX_ATTEMPTS_PER_EMAIL = 3;  // Max 3 richieste di reset per email
    private const MAX_ATTEMPTS_PER_IP = 10;    // Max 10 richieste totali da quell'IP
    private const DECAY_SECONDS = 900;         // 15 minuti

    public function ensureNotLocked(Request $request, string $email): void
    {
        $keys = [
            'forgot:email:' . sha1(Str::lower($email)) => self::MAX_ATTEMPTS_PER_EMAIL,
            'forgot:ip:' . $request->ip() => self::MAX_ATTEMPTS_PER_IP,
        ];

        foreach ($keys as $key => $maxAttempts) {
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $seconds = RateLimiter::availableIn($key);

                throw new ThrottleRequestsException(
                    'Troppe richieste di recupero password. Riprova tra qualche minuto.',
                    null,
                    ['Retry-After' => $seconds],
                );
            }
        }
    }

    public function hit(Request $request, string $email): void
    {
        RateLimiter::hit('forgot:email:' . sha1(Str::lower($email)), self::DECAY_SECONDS);
        RateLimiter::hit('forgot:ip:' . $request->ip(), self::DECAY_SECONDS);
    }
}