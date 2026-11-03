<?php

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Services\CompanyRoleResolver;

abstract class CompanyScopedPolicy
{

    protected const OWNER_ADMIN = [CompanyRole::OWNER, CompanyRole::ADMIN];

    protected const ALL_ROLES = [CompanyRole::OWNER, CompanyRole::ADMIN, CompanyRole::EMPLOYEE];

    public function __construct(protected readonly CompanyRoleResolver $roles)
    {
    }

    /** @param list<CompanyRole> $allowed */
    protected function allows(User $user, string $companyId, array $allowed): bool
    {
        return $this->roles->hasAnyRole($user, $companyId, $allowed);
    }
}
