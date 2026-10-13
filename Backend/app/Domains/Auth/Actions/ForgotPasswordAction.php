<?php

namespace App\Domains\Auth\Actions;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

class ForgotPasswordAction
{
    public function execute(string $email): void
    {
        dispatch(function () use ($email): void {
            $status = Password::sendResetLink(['email' => $email]);

            Log::info('Richiesta reset password', [
                'status' => $status,
                'email_hash' => hash('sha256', $email),
            ]);
        })->afterResponse();
    }
}
