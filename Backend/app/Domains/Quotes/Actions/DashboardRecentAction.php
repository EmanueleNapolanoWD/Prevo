<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;

class DashboardRecentAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null,
    ) {
    }

    public function execute(int $limit = 8): array
    {
        $query = Quote::query()
            ->where('company_id', $this->company->id)
            ->with('client')
            ->latest('updated_at')
            ->limit($limit);

        if ($this->user !== null) {
            $query->where('created_by', $this->user->id);
        }

        return $query->get()->map(function (Quote $quote): array {
            $client = $quote->client;

            return [
                'id' => $quote->id,
                'number' => $quote->number,
                'customerName' => $client?->display_name ?? $client?->name ?? 'Cliente',
                'total' => (float) $quote->total,
                'status' => $quote->status->value,
                'validUntil' => $quote->valid_until?->toIso8601String(),
            ];
        })->toArray();
    }
}