<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;

class DashboardTodosAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null,
    ) {
    }

    public function execute(): array
    {
        $config = config('dashboard.todos');
        $expiringDays = (int) $config['expiring_days'] ?? 7;
        $noReplyDays = (int) $config['no_reply_days'] ?? 7;
        $staleDraftDays = (int) $config['stale_draft_days'] ?? 5;
        $limit = (int) $config['limit'] ?? 10;

        $now = CarbonImmutable::now();

        $base = Quote::query()
            ->where('company_id', $this->company->id)
            ->with('client');

        if ($this->user !== null) {
            $base->where('created_by', $this->user->id);
        }

        $quotes = $base->get();

        $todos = [];

        foreach ($quotes as $quote) {
            $reason = $this->evaluateReason($quote, $now, $expiringDays, $noReplyDays, $staleDraftDays);

            if ($reason === null) {
                continue;
            }

            $client = $quote->client;
            $customerName = $client
                ? ($client->display_name ?? $client->name ?? 'Cliente')
                : 'Cliente';

            $todos[] = [
                'id' => $quote->id,
                'number' => $quote->number,
                'customerName' => $customerName,
                'total' => (float) $quote->total,
                'reason' => $reason['reason'],
                'detail' => $reason['detail'],
                'date' => $reason['date']?->toIso8601String() ?? $quote->updated_at->toIso8601String(),
                '_urgency' => $reason['urgency'],
            ];
        }

        // Ordina per urgenza (1 = più urgente), poi per data
        usort($todos, fn($a, $b) => $a['_urgency'] <=> $b['_urgency']);

        // Rimuovi il campo interno di ordinamento
        return array_slice(
            array_map(fn($t) => Arr::except($t, ['_urgency']), $todos),
            0,
            $limit
        );
    }

    private function evaluateReason(
        Quote $quote,
        CarbonImmutable $now,
        int $expiringDays,
        int $noReplyDays,
        int $staleDraftDays
    ): ?array {
        $status = $quote->status;

        // Stati conclusi: nessun todo
        if (in_array($status, [QuoteStatus::Accepted, QuoteStatus::Rejected, QuoteStatus::Expired], true)) {
            return null;
        }

        $updatedAt = $quote->updated_at instanceof CarbonImmutable
            ? $quote->updated_at
            : CarbonImmutable::instance($quote->updated_at);

        // 1. EXPIRING: SENT/VIEWED con valid_until entro N giorni
        if ($status === QuoteStatus::Sent || $quote->viewed_at !== null) {
            $validUntil = $quote->valid_until;
            if ($validUntil instanceof CarbonImmutable) {
                $diffDays = $now->diffInDays($validUntil, false);
                if ($diffDays >= 0 && $diffDays <= $expiringDays) {
                    return [
                        'reason' => 'scadenza',
                        'detail' => $diffDays === 0
                            ? 'Scade oggi'
                            : "Scade tra {$diffDays} giorni",
                        'date' => $validUntil,
                        'urgency' => 1,
                    ];
                }
            }
        }

        // 2. NO_REPLY: SENT/VIEWED, inviato da più di N giorni senza risposta
        if ($status === QuoteStatus::Sent || $quote->viewed_at !== null) {
            $sentAt = $quote->send_at;
            if ($sentAt instanceof CarbonImmutable) {
                $diffDays = $now->diffInDays($sentAt, false);
                if ($diffDays > $noReplyDays && $quote->accepted_at === null && $quote->rejected_at === null) {
                    return [
                        'reason' => 'risposta',
                        'detail' => "Inviato {$diffDays} giorni fa",
                        'date' => $sentAt,
                        'urgency' => 2,
                    ];
                }
            }
        }

        // 3. STALE_DRAFT: DRAFT non aggiornato da più di N giorni
        if ($status === QuoteStatus::Draft) {
            $diffDays = $now->diffInDays($updatedAt, false);
            if ($diffDays > $staleDraftDays) {
                return [
                    'reason' => 'bozza',
                    'detail' => "Ferma da {$diffDays} giorni",
                    'date' => $updatedAt,
                    'urgency' => 3,
                ];
            }
        }

        return null;
    }
}