<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Auth\Requests\RegisterUserRequest;
use App\Domains\Companies\Actions\InsertCompanyAction;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Requests\CompanyRequest;
use App\Domains\Auth\Resources\UserResource;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterUserAction
{

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly InsertCompanyAction $insertCompany,
    ) {
    }

    public function execute(
        RegisterUserRequest $userRequest,
        CompanyRequest $companyRequest
    ): JsonResponse {
        $userValidated = $userRequest->validated();
        $companyValidated = $companyRequest->validated();

        try {
            [$user, $company] = DB::transaction(function () use ($userValidated, $companyValidated) {

                // crea l'utente
                $user = User::create([
                    'name' => $userValidated['name'],
                    'surname' => $userValidated['surname'],
                    'email' => $userValidated['email'],
                    'password' => Hash::make($userValidated['password']),
                ]);

                $company = $this->insertCompany->execute($user, $companyValidated);

                return [$user, $company];
            });
        } catch (UniqueConstraintViolationException $e) {
            report($e);
            throw ValidationException::withMessages([
                'registration' => [
                    'Alcuni dati inseriti risultano già utilizzati. Controlla i campi e riprova.',
                ],
            ]);
        }

        // login automatico dopo la registrazione
        Auth::guard('web')->login($user);

        $userRequest->session()->regenerate();
        // update last login
        $user->update(['last_login_at' => now()]);


        // AUDIT: la transazione è già confermata
        $this->audit->log(
            event: 'user.registered',
            user: $user,
            company: $company,
            auditable: $user,
            new: [
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
            ],
            metadata: ['auto_login' => true],
        );

        $this->audit->log(
            event: 'company.created',
            user: $user,
            company: $company,
            auditable: $company,
            new: [
                'name' => $company->name,
                'legal_name' => $company->legal_name,
                'vat_number' => $company->vat_number,
            ],
            metadata: ['owner_role' => CompanyRole::OWNER->value],
        );


        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => (new UserResource($user))->resolve(),
            'company' => ['slug' => $company->slug],
        ], 201);
    }



}
