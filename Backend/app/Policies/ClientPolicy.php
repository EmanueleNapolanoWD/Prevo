<?php

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Enums\CompanyRole;

class ClientPolicy
{
    public function viewAny(User $user, string $companyId): bool
    {
        return $this->canAccessCompany($user, $companyId);
    }

    public function view(User $user, Client $client): bool
    {
        return $this->canAccessCompany($user, $client->company_id);
    }

    public function create(User $user, string $companyId): bool
    {
        return $this->canAccessCompany($user, $companyId);
    }

    public function update(User $user, Client $client): bool
    {
        return $this->canAccessCompany($user, $client->company_id);
    }

    public function delete(User $user, Client $client): bool
    {
        $role = $this->roleFor($user, $client->company_id);

        return in_array($role, ['OWNER', 'ADMIN'], true);
    }

    private function canAccessCompany(
        User $user,
        string $companyId
    ): bool {
        return $this->roleFor($user, $companyId) !== null;
    }

    private function roleFor(User $user, string $companyId): ?string
    {
        $role = $user->companyUsers()
            ->where('company_id', $companyId)
            ->value('role');

        if ($role === null) {
            return null;
        }

        return $role instanceof CompanyRole ? $role->value : (string) $role;
    }
}
