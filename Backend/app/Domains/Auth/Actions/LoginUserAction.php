<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\DTOs\LoginUserData;
use App\Domains\Auth\Models\User;
use App\Domains\Auth\Supports\LoginRateLimiter;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    private static ?string $dummyHash = null;

    public function __construct(
        private readonly LoginRateLimiter $limiter,
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(LoginUserData $data, Request $request)
    {

        // 1. Blocca PRIMA di toccare il database o l'hash
        try {
            $this->limiter->ensureNotLocked($request, $data->email);
        } catch (ThrottleRequestsException $e) {
            // Logga solo il primo rifiuto per finestra
            $lockKey = 'audit:login_locked:' . sha1(Str::lower($data->email . '|' . $request->ip()));

            if (Cache::add($lockKey, true, now()->addMinutes(5))) {
                $this->audit->log(
                    event: 'auth:login_locked',
                    user: User::where('email', $data->email)->first(), // <-- Corretto qui
                    metadata: ['email' => $data->email]
                );
            }

            throw $e;
        }

        // 2. Tentativo di login
        $this->equalizeTiming(
            $data->email,
            $data->password,
        );

        // tentativo di login
        if (
            !Auth::guard('web')->attempt(
                ['email' => $data->email, 'password' => $data->password],
                $data->remember
            )
        ) {
            $this->limiter->hit($request, $data->email);

            $this->audit->log(
                event: 'auth_login_failed',
                user: User::where('email', $request->input('email'))->first(),
                metadata: ['email' => $request->input('email')],
            );

            throw ValidationException::withMessages(['email' => ['Le credenziali inserite non sono valide.']]);
        }

        // nuovo id sessione
        $request->session()->regenerate();

        $this->limiter->clear($request, $data->email);

        $user = Auth::guard('web')->user();

        // aggiorna last_login_at
        /** @var User $user */
        $user->update(['last_login_at' => now()]);

        // AUDIT
        $this->audit->log(
            event: 'auth_login',
            user: $user,
            auditable: $user,
            metadata: ['remember' => $request->boolean('remember')]
        );

        return $user;
    }

    /**
     * Se l'email non esiste, Auth::attempt() non calcola nessun hash e risponde
     * molto più in fretta: confrontando i tempi un attaccante scopre quali email
     * sono registrate (user enumeration). Eseguendo un Hash::check "a vuoto"
     * il costo resta lo stesso in entrambi i casi.
     */
    private function equalizeTiming(string $email, string $password): void
    {
        if (User::where('email', $email)->exists()) {
            return;
        }

        self::$dummyHash ??= Hash::make(Str::random(32));

        Hash::check($password, self::$dummyHash);
    }
}
