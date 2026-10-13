<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Auth\Requests\RegisterUserRequest;
use App\Domains\Companies\Models\Company;
use App\Http\Resources\UserResource;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterUserAction
{
    public function execute(RegisterUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $user = DB::transaction(function () use ($validated) {

                // crea l'utente
                $user = User::create([
                    'name' => $validated['name'],
                    'surname' => $validated['surname'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);

                // crea l'azienda
                $company = Company::create([
                    'name' => $validated['company_name'],
                    'legal_name' => $validated['legal_name'],
                    'vat_number' => $validated['vat_number'],
                    'tax_code' => $validated['tax_code'],
                    'address' => $validated['address'],
                    'postal_code' => $validated['postal_code'],
                    'city' => $validated['city'],
                    'province' => $validated['province'],
                    'email' => $validated['company_email'],
                    'phone' => $validated['phone'],
                    'website' => $validated['website'] ?? null,
                ]);

                // associa l'utente all'azienda
                $user->companies()->attach($company);

                // set settings per compny
                $company->companySettings()->create([
                    'quote_prefix' => 'PREV',
                    'quote_start_number' => 1,
                    'default_vat_rate' => 22.00,
                    'default_validity_days' => 30,
                    'default_currency' => 'EUR',
                ]);

                // AGGIUNGERE AUDIT

                return $user;
            });
        } catch (UniqueConstraintViolationException $e) {
            throw ValidationException::withMessages([
                'email' => [__('Impossibile completare la registrazione con questi dati.')],
            ]);
        }

        // login automatico dopo la registrazione
        Auth::guard('web')->login($user);

        // update last login
        $user->update(['last_login_at' => now()]);

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => (new UserResource($user))->resolve(),
        ], 201);
    }
}
