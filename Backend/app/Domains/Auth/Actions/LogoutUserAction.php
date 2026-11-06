<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\TransientToken;

class LogoutUserAction
{

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }
    public function execute(Request $request): JsonResponse
    {
        $user = $request->user();
        $tokenRevoked = false;

        // Revoca il token solo se la richiesta usa un token API reale.
        $currentAccessToken = $user?->currentAccessToken();

        if (
            $currentAccessToken !== null
            && !($currentAccessToken instanceof TransientToken)
        ) {
            $currentAccessToken->delete();
            $tokenRevoked = true;
        }

        // Termina la sessione web, se presente.
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // registrare l'evento nell'audit log.
        if ($user !== null) {
            $this->audit->log(
                event: 'auth.logout',
                user: $user,
                auditable: $user,
                metadata: [
                    'token_revoked' => $tokenRevoked,
                    'session_invalidated' => $request->hasSession(),
                ],
            );
        }

        return response()->json([
            'message' => 'Logout effettuato con successo',
        ]);
    }
}
