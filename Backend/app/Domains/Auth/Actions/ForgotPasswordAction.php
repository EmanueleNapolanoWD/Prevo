<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use Illuminate\Support\Facades\Password;

class ForgotPasswordAction
{

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(string $email): void
    {
        dispatch(function () use ($email): void {
            $status = Password::sendResetLink(['email' => $email]);

            $user = User::where('email',$email)->first();

            $this->audit->log(
                event: 'auth.password_reset_requested',
                user: $user, // null se l'email non esiste
                auditable: $user,
                metadata: [
                    'status' => $status,
                    'email_hash' => hash('sha256', $email),
                ],
            );
        })->afterResponse();
    }
}
