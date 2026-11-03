<?php

namespace App\Domains\Auth\Actions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\TransientToken;

class LogoutUserAction
{
    public function execute(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoca il token solo se la richiesta usa un token API reale.
        $currentAccessToken = $user?->currentAccessToken();

        if (
            $currentAccessToken !== null
            && ! ($currentAccessToken instanceof TransientToken)
        ) {
            $currentAccessToken->delete();
        }

        // Termina la sessione web, se presente.
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // TODO: registrare l'evento nell'audit log.

        return response()->json([
            'message' => 'Logout effettuato con successo',
        ]);
    }
}
