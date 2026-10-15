<?php

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;

class CompanyPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    /** Qualsiasi membro dell'azienda può vedere le impostazioni. */
    public function viewSettings(User $user, Company $company): bool
    {
        return $this->roleIn($user, $company) !== null;
    }

    // Update Settings (OWNER-ADMIN)
    public function updateSettings(User $user, Company $company)
    {
        return in_array(
            $this->roleIn($user, $company),
            [CompanyRole::OWNER->value, CompanyRole::ADMIN->value],
            true
        );
    }


    /** Ruolo dell'utente nell'azienda come stringa, o null se non è membro. */
    private function roleIn(User $user, Company $company): ?string
    {
        $role = $user->companies()
            ->whereKey($company->getKey())
            ->first()
            ?->pivot
                ?->role;

        return $role instanceof \BackedEnum ? $role->value : $role;
    }
}
