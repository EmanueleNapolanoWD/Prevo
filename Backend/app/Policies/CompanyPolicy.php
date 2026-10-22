<?php

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;

class CompanyPolicy
{
    /** OWNER e ADMIN possono vedere i dati azienda. */
    public function viewCompanyData(User $user, Company $company): bool
    {
        return $this->hasRole($user, $company, [CompanyRole::OWNER, CompanyRole::ADMIN]);
    }

    /** Solo OWNER può modificare i dati azienda. */
    public function updateCompanyData(User $user, Company $company): bool
    {
        return $this->hasRole($user, $company, [CompanyRole::OWNER]);
    }

    /** Qualsiasi membro dell'azienda può vedere le impostazioni. */
    public function viewSettings(User $user, Company $company): bool
    {
        return $this->roleIn($user, $company) !== null;
    }

    /** OWNER e ADMIN possono modificare le impostazioni. */
    public function updateSettings(User $user, Company $company): bool
    {
        return $this->hasRole($user, $company, [CompanyRole::OWNER, CompanyRole::ADMIN]);
    }

    /** @param list<CompanyRole> $roles */
    private function hasRole(User $user, Company $company, array $roles): bool
    {
        return in_array($this->roleIn($user, $company), $roles, true);
    }

    /** Ruolo dell'utente nell'azienda, o null se non è membro. */
    private function roleIn(User $user, Company $company): ?CompanyRole
    {
        $role = $user->companies()
            ->whereKey($company->getKey())
            ->first()
            ?->pivot
            ?->role;

        return $role instanceof CompanyRole ? $role : CompanyRole::tryFrom((string) $role);
    }
}