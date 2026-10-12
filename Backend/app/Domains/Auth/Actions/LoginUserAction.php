<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Auth\Requests\LoginUserRequest;
use App\Domains\Auth\Supports\LoginRateLimiter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    private static ?string $dummyHash = null;

    public function __construct(
        private readonly LoginRateLimiter $limiter,
    ) {}

    public function execute(LoginUserRequest $request): User
    {

        // 1. Blocca PRIMA di toccare il database o l'hash
        $this->limiter->ensureNotLocked($request, $request->input('email'));

        // 2. Tentativo di login
        $user = $this->equalizeTiming($request['email'], $request['password']);

        $validated = $request->validated();

        // tentativo di login
        if (! Auth::guard('web')->attempt($validated, $request->boolean('remember'))) {
            $this->limiter->hit($request, $request->input('email'));
            throw ValidationException::withMessages(['email' => ['Le credenziali inserite non sono valide.']]);
        }

        // nuovo id sessione
        $request->session()->regenerate();

        $this->limiter->clear($request, $request->input('email'));

        $user = Auth::guard('web')->user();

        // aggiorna last_login_at
        /** @var User $user */
        $user->update(['last_login_at' => now()]);

        // ATTENZIONE!!!!! AGGIUNGERE AUDIT

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
