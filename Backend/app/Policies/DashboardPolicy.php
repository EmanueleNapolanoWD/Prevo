<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Enums\CompanyRole;

class DashboardPolicy extends CompanyScopedPolicy
{
    /** Tutti i membri possono vedere la dashboard. */
    public function viewDashboard(User $user, Company $company): bool
    {
        return $this->allows($user, $company->getKey(), self::ALL_ROLES);
    }

    /** Solo l'OWNER può vedere gli insights. */
    public function viewInsights(User $user, Company $company): bool
    {
        $role = $this->roles->roleFor($user, $company->getKey());

        return $role === CompanyRole::OWNER;
    }
}