<?php

declare(strict_types=1);

namespace App\Domains\Companies\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;

// unico punto in cui si legge il ruolo di un utente
final class CompanyRoleResolver
{
    /** @var array<string, ?CompanyRole> */
    private array $cache = [];

    public function roleFor(User $user, string $companyId): ?CompanyRole
    {
        $key = $user->getKey().'|'.$companyId;

        if (! array_key_exists($key, $this->cache)) {
            $this->cache[$key] = $this->normalize(
                $user->companyUsers()->where('company_id', $companyId)->value('role'),
            );
        }

        return $this->cache[$key];
    }

    public function isMember(User $user, string $companyId): bool
    {
        return $this->roleFor($user, $companyId) !== null;
    }

    /** @param list<CompanyRole> $allowed */
    public function hasAnyRole(User $user, string $companyId, array $allowed): bool
    {
        $role = $this->roleFor($user, $companyId);

        return $role !== null && in_array($role, $allowed, true);
    }

    /** Da chiamare se il ruolo cambia durante la stessa richiesta. */
    public function forget(User $user, string $companyId): void
    {
        unset($this->cache[$user->getKey().'|'.$companyId]);
    }

    /** value('role') può restituire enum (se castato), stringa o null. */
    private function normalize(mixed $role): ?CompanyRole
    {
        if ($role instanceof CompanyRole) {
            return $role;
        }

        return $role === null ? null : CompanyRole::tryFrom(strtoupper((string) $role));
    }
}