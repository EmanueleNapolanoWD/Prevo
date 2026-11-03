<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domains\Auth\Models\User;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;

class QuotePolicy extends CompanyScopedPolicy
{
    private const READ = self::ALL_ROLES;

    private const WRITE = self::ALL_ROLES;

    private const DELETE = self::OWNER_ADMIN;

    /** Stati in cui il preventivo non si modifica più (documento concluso). */
    private const LOCKED_STATUSES = [QuoteStatus::Accepted, QuoteStatus::Rejected];

    public function viewAny(User $user, string $companyId): bool
    {
        return $this->allows($user, $companyId, self::READ);
    }

    public function view(User $user, Quote $quote): bool
    {
        return $this->allows($user, $quote->company_id, self::READ);
    }

    public function create(User $user, string $companyId): bool
    {
        return $this->allows($user, $companyId, self::WRITE);
    }

    public function update(User $user, Quote $quote): bool
    {
        return $quote->status->isEditable()
            && $this->allows($user, $quote->company_id, self::WRITE);
    }

    /** Invio al cliente: stessi ruoli della modifica, e solo se il preventivo non è concluso. */
    public function send(User $user, Quote $quote): bool
    {
        return $this->update($user, $quote);
    }

    /** Creazione/revoca dei link pubblici (quote_public_links). */
    public function share(User $user, Quote $quote): bool
    {
        return $this->allows($user, $quote->company_id, self::WRITE);
    }

    /** Duplicare equivale a creare un nuovo preventivo: basta poter leggere l'originale e scrivere. */
    public function duplicate(User $user, Quote $quote): bool
    {
        return $this->allows($user, $quote->company_id, self::WRITE);
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $this->allows($user, $quote->company_id, self::DELETE);
    }

    public function restore(User $user, Quote $quote): bool
    {
        return $this->allows($user, $quote->company_id, self::DELETE);
    }

    private function isLocked(Quote $quote): bool
    {
        return in_array($quote->status, self::LOCKED_STATUSES, true);
    }
}