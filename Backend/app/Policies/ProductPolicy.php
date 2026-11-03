<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Products\Models\Product;

class ProductPolicy extends CompanyScopedPolicy
{
    private const READ = self::ALL_ROLES;

    private const WRITE = self::ALL_ROLES;

    private const DELETE = self::OWNER_ADMIN;

    public function viewAny(User $user, string $companyId): bool
    {
        return $this->allows($user, $companyId, self::READ);
    }

    public function view(User $user, Product $product): bool
    {
        return $this->allows($user, $product->company_id, self::READ);
    }

    public function create(User $user, string $companyId): bool
    {
        return $this->allows($user, $companyId, self::WRITE);
    }

    public function update(User $user, Product $product): bool
    {
        return $this->allows($user, $product->company_id, self::WRITE);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->allows($user, $product->company_id, self::DELETE);
    }

    public function restore(User $user, Product $product): bool
    {
        return $this->allows($user, $product->company_id, self::DELETE);
    }
}