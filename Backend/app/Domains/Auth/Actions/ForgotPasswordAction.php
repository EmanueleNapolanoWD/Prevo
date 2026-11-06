<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\DTOs\ForgotPasswordData;
use App\Domains\Auth\Models\User;
use App\Domains\Auth\Supports\ForgotPasswordRateLimiter;
use Illuminate\Support\Facades\Password;

class ForgotPasswordAction
{

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly ForgotPasswordRateLimiter $rateLimiter,
    ) {
    }

    public function execute(ForgotPasswordData $data, $request): void
    {
        // verifica se l'utente ha superato il limite di richieste
        $this->rateLimiter->ensureNotLocked($request, $data->email);
        $this->rateLimiter->hit($request, $data->email);

        dispatch(function () use ($data): void {
            // verifica se user esiste per loggare l'evento, ma non rivelare se esiste o meno
            $user = User::where('email', $data->email)->first();
            $userExists = $user !== null;

            // invia il link di reset della password
            $status = Password::sendResetLink(['email' => $data->email]);

            // logga l'evento di richiesta reset password
            $this->audit->log(
                event: 'auth.password_reset_requested',
                user: $user, // null se l'email non esiste
                auditable: $user,
                metadata: [
                    'status' => $status,
                    'user_exists' => $userExists,
                    'email_hash' => hash('sha256', $data->email),
                ],
            );
        })->afterResponse();
    }
}
