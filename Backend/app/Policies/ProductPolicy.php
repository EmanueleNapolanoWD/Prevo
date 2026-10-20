<?php

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Products\Models\Product;

class ProductPolicy
{

    /** Ruoli (valori di company_user.role): adattali ai tuoi. */
    private const READ = [CompanyRole::OWNER, CompanyRole::ADMIN, CompanyRole::EMPLOYEE];
    private const WRITE = [CompanyRole::OWNER, CompanyRole::ADMIN, CompanyRole::EMPLOYEE];
    private const DELETE = [CompanyRole::OWNER, CompanyRole::ADMIN];

    /** Cache per richiesta: evita una query per ogni controllo. */
    private array $roles = [];


    public function __construct()
    {
        //
    }

    public function viewAny(User $user, string $companyId): bool
    {
        return $this->hasRole($user, $companyId, self::READ);
    }

    public function view(User $user, Product $product): bool
    {
        return $this->hasRole($user, $product->company_id, self::READ);
    }

    public function create(User $user, string $companyId): bool
    {
        return $this->hasRole($user, $companyId, self::WRITE);
    }

    public function update(User $user, Product $product): bool
    {
        return $this->hasRole($user, $product->company_id, self::WRITE);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->hasRole($user, $product->company_id, self::DELETE);
    }

    public function restore(User $user, Product $product): bool
    {
        return $this->hasRole($user, $product->company_id, self::DELETE);
    }


    // ====== HELPER
    /** @param list<CompanyRole> $allowed */
    private function hasRole(User $user, string $companyId, array $allowed): bool
    {
        $key = $user->getKey() . '|' . $companyId;

        if (!array_key_exists($key, $this->roles)) {
            $this->roles[$key] = $user->companyUsers()
                ->where('company_id', $companyId)
                ->value('role');
        }

        $role = $this->roles[$key];

        if (is_string($role)) {
            $role = CompanyRole::tryFrom(strtoupper($role));
        }

        return $role instanceof CompanyRole && in_array($role, $allowed, true);
    }
}
