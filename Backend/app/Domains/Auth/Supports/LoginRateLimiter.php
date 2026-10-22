<?php

namespace App\Domains\Auth\Supports;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/**
 * Rate limiting a due livelli per il login:
 *  - per coppia email+IP  -> blocca il brute force su un singolo account
 *  - per IP               -> blocca il credential stuffing (tante email diverse)
 *
 * La chiave per-account include l'IP di proposito: un attaccante non può
 * bloccare dall'esterno l'account di un utente legittimo (lockout DoS).
 */
class LoginRateLimiter
{
    private const MAX_ATTEMPTS_PER_ACCOUNT = 5;

    private const MAX_ATTEMPTS_PER_IP = 20;

    // Durata del blocco / finestra di conteggio, in secondi (15 minuti).
    private const DECAY_SECONDS = 900;

    public function ensureNotLocked(
        Request $request,
        string $email): void
    {
        foreach ($this->limits($request, $email) as $key => $maxAttempts) {
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                event(new Lockout($request));

                $seconds = RateLimiter::availableIn($key);

                throw new ThrottleRequestsException(
                    'Troppi tentativi di accesso. Riprova più tardi.',
                    null,
                    ['Retry-After' => $seconds],
                );
            }
        }
    }

    public function hit(
        Request $request,
        string $email
    ): void {
        foreach (array_keys($this->limits($request, $email)) as $key) {
            RateLimiter::hit($key, self::DECAY_SECONDS);
        }
    }

    private function limits(Request $request, string $email): array
    {
        return [
            $this->accountKey($request, $email) => self::MAX_ATTEMPTS_PER_ACCOUNT,
            'login:ip:'.$request->ip() => self::MAX_ATTEMPTS_PER_IP,
        ];
    }

    /**
     * Dopo un login riuscito azzera SOLO il contatore dell'account.
     * Il contatore per IP resta, altrimenti chi ha un account valido
     * potrebbe "resettare" il limite mentre prova altre credenziali.
     */
    public function clear(Request $request, string $email): void
    {
        RateLimiter::clear($this->accountKey($request, $email));
    }

    private function accountKey(Request $request, string $email): string
    {
        // hash: nessuna email in chiaro in Redis/cache
        return 'login:account:'.sha1(Str::lower($email).'|'.$request->ip());
    }
}
