<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;

class CompanyPolicy extends CompanyScopedPolicy
{
    /** OWNER e ADMIN possono vedere i dati azienda. */
    public function viewCompanyData(User $user, Company $company): bool
    {
        return $this->allows($user, $this->id($company), self::OWNER_ADMIN);
    }

    /** Solo OWNER può modificare i dati azienda. */
    public function updateCompanyData(User $user, Company $company): bool
    {
        return $this->allows($user, $this->id($company), [CompanyRole::OWNER]);
    }

    /** Qualsiasi membro dell'azienda può vedere le impostazioni (anche quelle dei preventivi). */
    public function viewSettings(User $user, Company $company): bool
    {
        return $this->roles->isMember($user, $this->id($company));
    }

    /** OWNER e ADMIN possono modificare le impostazioni (anche quelle dei preventivi). */
    public function updateSettings(User $user, Company $company): bool
    {
        return $this->allows($user, $this->id($company), self::OWNER_ADMIN);
    }

    private function id(Company $company): string
    {
        return (string) $company->getKey();
    }
}