<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\DTOs\RegisterUserData;
use App\Domains\Auth\Models\User;
use App\Domains\Auth\Supports\RegisterRateLimiter;
use App\Domains\Companies\Actions\InsertCompanyAction;
use App\Domains\Companies\DTOs\CompanyData;
use App\Domains\Companies\Enums\CompanyRole;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterUserAction
{

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly InsertCompanyAction $insertCompany,
        private readonly RegisterRateLimiter $rateLimiter,
    ) {
    }

    public function execute(
        RegisterUserData $userData,
        CompanyData $companyData,
        $session,
        Request $request
    ): array {

        // Controlla se l'IP ha superato il limite di tentativi
        $this->rateLimiter->ensureNotLocked($request);
        $this->rateLimiter->hit($request);

        try {
            [$user, $company] = DB::transaction(function () use ($userData, $companyData) {

                // crea l'utente
                $user = User::create([
                    'name' => $userData->name,
                    'surname' => $userData->surname,
                    'email' => $userData->email,
                    'password' => Hash::make($userData->password),
                ]);

                $company = $this->insertCompany->execute($user, $companyData);

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

        $session->regenerate();
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

        return [$user, $company];
    }



}
