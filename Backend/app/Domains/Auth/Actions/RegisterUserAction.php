<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Auth\Requests\RegisterUserRequest;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Requests\CompanyRequest;
use App\Http\Resources\UserResource;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegisterUserAction
{
    public function execute(
        RegisterUserRequest $userRequest,
        CompanyRequest $companyRequest): JsonResponse
    {
        $userValidated = $userRequest->validated();
        $companyValidated = $companyRequest->validated();

        try {
            $user = DB::transaction(function () use ($userValidated,$companyValidated) {

                // crea l'utente
                $user = User::create([
                    'name' => $userValidated['name'],
                    'surname' => $userValidated['surname'],
                    'email' => $userValidated['email'],
                    'password' => Hash::make($userValidated['password']),
                ]);

                // crea l'azienda (le company_settings le crea l'evento created del model)
                $company = Company::create([
                    // anagrafica
                    'name' => $companyValidated['company_name'],
                    'legal_name' => $companyValidated['legal_name'],
                    'legal_form' => $companyValidated['legal_form'] ?? null,
                    'slug' => $this->generateUniqueSlug($companyValidated['company_name']),

                    // dati fiscali
                    'country_code' => $companyValidated['country_code'] ?? 'IT',
                    'vat_number' => $companyValidated['vat_number'],
                    'tax_code' => $companyValidated['tax_code'] ?? null,
                    'tax_regime' => $companyValidated['tax_regime'] ?? null,
                    'sdi_code' => $companyValidated['sdi_code'] ?? null,
                    'pec' => $companyValidated['pec'] ?? null,

                    // sede legale
                    'address' => $companyValidated['address'],
                    'postal_code' => $companyValidated['postal_code'],
                    'city' => $companyValidated['city'],
                    'province' => $companyValidated['province'],

                    // contatti
                    'email' => $companyValidated['company_email'],
                    'phone' => $companyValidated['phone'],
                    'website' => $companyValidated['website'] ?? null,

                    // eventuale periodo di prova (decommenta se lo vuoi)
                    'trial_ends_at' => now()->addDays(14),
                ]);

                // associa l'utente all'azienda
                $user->companies()->attach($company->id, [
                    'role' => CompanyRole::OWNER->value,
                ]);


                // AGGIUNGERE AUDIT

                return $user;
            });
        } catch (UniqueConstraintViolationException $e) {
            report($e);
            throw ValidationException::withMessages([
                'email' => [__('Impossibile completare la registrazione con questi dati.')],
            ]);
        }

        // login automatico dopo la registrazione
        Auth::guard('web')->login($user);

        // update last login
        $user->update(['last_login_at' => now()]);

        $userRequest->session()->regenerate();

        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => (new UserResource($user))->resolve(),
        ], 201);
    }


    // funzione che serve a generare slug univoco per le company
    private function generateUniqueSlug(string $name): string
    {
        $base = Str::slug(mb_substr($name, 0, 80)) ?: 'azienda';
        $slug = $base;
        $i = 2;

        while (Company::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
