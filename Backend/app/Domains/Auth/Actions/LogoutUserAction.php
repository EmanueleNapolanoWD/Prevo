<?php

namespace App\Domains\Auth\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutUserAction
{
    public function execute(
        Request $request
    ) {

        Auth::guard('web')->logout();

        $request->user()->currentAccessToken()->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // AGGIUNGERE AUDIT

        return response()->json([
            'message' => 'Logout effettuato con successo',
        ]);
    }
}
