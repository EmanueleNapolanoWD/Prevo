<?php

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Actions\LoginUserAction;
use App\Domains\Auth\Actions\LogoutUserAction;
use App\Domains\Auth\Actions\RegisterUserAction;
use App\Domains\Auth\Models\User;
use App\Domains\Auth\Requests\LoginUserRequest;
use App\Domains\Auth\Requests\RegisterUserRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(
        LoginUserRequest $request,
        LoginUserAction $action
    ): JsonResponse {
        $user = $action->execute($request);

        return response()->json([
            'message' => 'Login effettuato con successo',
            'user' => (new UserResource($user))->resolve(),
        ]);
    }

    // registrazione
    public function registerUser(
        RegisterUserRequest $request,
        RegisterUserAction $action
    ): JsonResponse {

        $user = $action->execute($request);

        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => (new UserResource($user))->resolve(),
        ], 201);
    }

    // recupero user
    public function user(Request $request)
    {
        return response()->json([
            'user' => (new UserResource($request->user()))->resolve(),
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
