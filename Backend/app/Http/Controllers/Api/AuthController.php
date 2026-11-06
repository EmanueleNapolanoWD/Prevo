<?php

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Actions\ForgotPasswordAction;
use App\Domains\Auth\Actions\LoginUserAction;
use App\Domains\Auth\Actions\LogoutUserAction;
use App\Domains\Auth\Actions\RegisterUserAction;
use App\Domains\Auth\Actions\ResetPasswordAction;
use App\Domains\Auth\DTOs\ForgotPasswordData;
use App\Domains\Auth\DTOs\LoginUserData;
use App\Domains\Auth\DTOs\RegisterUserData;
use App\Domains\Auth\DTOs\ResetPasswordData;
use App\Domains\Auth\Requests\ForgotPasswordRequest;
use App\Domains\Auth\Requests\LoginUserRequest;
use App\Domains\Auth\Requests\RegisterRequest;
use App\Domains\Auth\Requests\ResetPasswordRequest;
use App\Domains\Auth\Resources\UserResource;
use App\Domains\Companies\DTOs\CompanyData;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(
        LoginUserRequest $request,
        LoginUserAction $action
    ): JsonResponse {

        $dto = LoginUserData::fromValidated($request->validated());

        $user = $action->execute($dto, $request);

        return response()->json([
            'message' => 'Login effettuato con successo',
            'user' => (new UserResource($user))->resolve(),
        ]);
    }

    // registrazione
    public function registerUser(
        RegisterRequest $request,
        RegisterUserAction $action
    ) {
        $validated = $request->validated();

        [$user, $company] = $action->execute(
            RegisterUserData::fromValidated($validated),
            CompanyData::fromValidated($validated),
            $request->session(),
            $request 
        );

        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => (new UserResource($user))->resolve(),
            'company' => ['slug' => $company->slug],
        ], 201);
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

        $dto = ForgotPasswordData::fromValidated($request->validated());

        $action->execute($dto, $request);

        return response()->json([
            'message' => 'Se esiste un account associato a questa email, riceverai un link per reimpostare la password.',
        ]);
    }

    // reset password
    public function resetPassword(
        ResetPasswordRequest $request,
        ResetPasswordAction $action
    ): JsonResponse {

        $dto = ResetPasswordData::fromValidated($request->validated());

        $status = $action->execute($dto);

        if ($status !== Password::PASSWORD_RESET) {

            $message = match ($status) {
                Password::INVALID_TOKEN => 'Il link di recupero password non è valido o è già stato utilizzato.',
                Password::INVALID_USER => 'Non è stato trovato alcun utente associato a questo indirizzo email.',
                default => 'Errore durante il reset della password.',
            };

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }

        return response()->json([
            'message' => $message ?? 'La password è stata reimpostata con successo.',
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
