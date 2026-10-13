<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordAction
{
    public function execute(array $data): string
    {
        // Logica per reimpostare la password dell'utente
        // Ad esempio, puoi utilizzare il modello User per trovare l'utente e aggiornare la password
        return Password::reset(
            $data,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // revoca tutti i token di accesso dell'utente
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );
    }
}
