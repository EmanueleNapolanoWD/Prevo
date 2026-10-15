<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordAction
{
    
public function __construct(
    private readonly AuditLogger $audit
){}

    public function execute(array $data): string
    {

    $resetUser = null;

        // Logica per reimpostare la password dell'utente
        // Ad esempio, puoi utilizzare il modello User per trovare l'utente e aggiornare la password
        $status = Password::reset(
            $data,
            function (User $user, string $password) use (&$resetUser): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // revoca tutti i token di accesso dell'utente
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if($status === Password::PASSWORD_RESET){
            $this->audit->log(
                  event: 'auth.password_reset',
                user: $resetUser,
                auditable: $resetUser,
                metadata: ['tokens_revoked' => true],
            );
        }else {
            $this->audit->log(
                event: 'auth.password_reset_failed',
                metadata: [
                    'status'     => $status, // INVALID_TOKEN, INVALID_USER...
                    'email_hash' => hash('sha256', Str::lower($data['email'] ?? '')),
                ],
            );
        }

        return $status;
}
}
