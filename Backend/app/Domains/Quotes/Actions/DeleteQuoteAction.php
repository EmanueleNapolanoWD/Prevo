<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use DomainException;
use Illuminate\Support\Facades\DB;

class DeleteQuoteAction
{
    private const DELETABLE_STATUSES = ['DRAFT'];

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(
        Quote $quote,
        User $user,
        Company $company
    ): void {
        DB::transaction(function () use ($quote, $user, $company) {
            $quote = Quote::query()
                ->whereKey($quote->getKey())
                ->lockForUpdate()
                ->with('items')
                ->firstOrFail();

            if (!$quote->status->isDeletable()) {
                throw new DomainException('Solo i preventivi in bozza possono essere eliminati.');
            }

            $snapshot = $quote->only([
                'number',
                'version',
                'status',
                'client_id',
                'title',
                'total'
            ]);

            $quote->delete();

            $this->audit->log(
                event: 'quote.deleted',
                user: $user,
                company: $company,
                auditable: $quote,
                old: $snapshot,
                new: null,
            );
        });
    }
}