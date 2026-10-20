<?php

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Actions\ForgotPasswordAction;
use App\Domains\Auth\Actions\LoginUserAction;
use App\Domains\Auth\Actions\LogoutUserAction;
use App\Domains\Auth\Actions\RegisterUserAction;
use App\Domains\Auth\Actions\ResetPasswordAction;
use App\Domains\Auth\Requests\ForgotPasswordRequest;
use App\Domains\Auth\Requests\LoginUserRequest;
use App\Domains\Auth\Requests\RegisterUserRequest;
use App\Domains\Auth\Requests\ResetPasswordRequest;
use App\Domains\Auth\Resources\UserResource;
use App\Domains\Companies\Requests\CompanyRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(
        LoginUserRequest $request,
        LoginUserAction $action
    ) {
        $user = $action->execute($request);
    }

    // registrazione
    public function registerUser(
        RegisterUserRequest $userRequest,
        CompanyRequest $companyRequest,
        RegisterUserAction $action
    ) {
        $user = $action->execute($userRequest, $companyRequest);
    }

    // Recupero dell'utente autenticato con le sue aziende associate
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        // Carica la relazione solo se non è già stata caricata
        if (!$user->relationLoaded('companies')) {
            $user->load('companies');
        }

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    // forgot password
    public function forgotPassword(
        ForgotPasswordRequest $request,
        ForgotPasswordAction $action
    ): JsonResponse {

        $action->execute($request->validated('email'));

        return response()->json([
            'message' => 'Se esiste un account associato a questa email, riceverai un link per reimpostare la password.',
        ]);
    }

    // reset password
    public function resetPassword(
        ResetPasswordRequest $request,
        ResetPasswordAction $action
    ): JsonResponse {
        $status = $action->execute($request->validated());

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Errore durante il reset della password.',
            ], 400);
        }

        return response()->json([
            'message' => 'Password reimpostata con successo.',
        ]);
    }

    // logout
    public function logout(
        Request $request,
        LogoutUserAction $action
    ) {
        return $action->execute($request);
    }
}
