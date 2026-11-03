<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

class DashboardKpisAction
{
    public function __construct(private readonly Company $company, private readonly ?User $user = null)
    {
    }

    public function execute(string $range = '30d'): array
    {
        $days = $this->parseRange($range);

        $now = CarbonImmutable::now();
        $start = $now->copy()->subDays($days)->startOfDay();
        $end = $now->copy()->endOfDay();

        $prevStart = $start->copy()->subDays($days);
        $prevEnd = $end->copy()->subDays($days);

        $base = $this->baseQuery();

        // ---- quotesSent: inviati nel periodo (send_at nel range) ----
        $sentQuery = clone $base;
        $sentQuery->whereBetween('send_at', [$start, $end]);
        $quotesSent = $sentQuery->count();

        $prevSentQuery = clone $base;
        $prevSentQuery->whereBetween('send_at', [$prevStart, $prevEnd]);
        $quotesSentPrev = $prevSentQuery->count();

        // ---- acceptanceRate: accettati / inviati nel periodo ----
        $acceptedQuery = clone $base;
        $acceptedQuery->whereBetween('accepted_at', [$start, $end]);
        $quotesAccepted = $acceptedQuery->count();

        $acceptanceRate = $quotesSent > 0
            ? round(($quotesAccepted / $quotesSent) * 100, 2)
            : 0.0;

        $prevAcceptedQuery = clone $base;
        $prevAcceptedQuery->whereBetween('accepted_at', [$prevStart, $prevEnd]);
        $quotesAcceptedPrev = $prevAcceptedQuery->count();

        $prevSentForRate = $quotesSentPrev > 0
            ? round(($quotesAcceptedPrev / $quotesSentPrev) * 100, 2)
            : 0.0;

        // ---- pipelineValue: SENT/VIEWED non scaduti (stato attuale, non dipende dal range) ----
        $pipelineQuery = clone $base
            ->where(function ($q) {
                $q->where('status', QuoteStatus::Sent)
                    ->orWhereNotNull('viewed_at');
            })
            ->whereNotIn('status', [
                QuoteStatus::Accepted,
                QuoteStatus::Rejected,
                QuoteStatus::Expired,
            ])
            ->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>', $now);
            });
        $pipelineValue = (float) $pipelineQuery->sum('total');

        // ---- acceptedValue: accettati nel periodo (accepted_at nel range) ----
        $acceptedValueQuery = clone $base;
        $acceptedValueQuery->whereBetween('accepted_at', [$start, $end]);
        $acceptedValue = (float) $acceptedValueQuery->sum('total');

        $prevAcceptedValueQuery = clone $base;
        $prevAcceptedValueQuery->whereBetween('accepted_at', [$prevStart, $prevEnd]);
        $acceptedValuePrev = (float) $prevAcceptedValueQuery->sum('total');

        return [
            'quotesSent' => $this->kpi($quotesSent, $quotesSentPrev),
            'acceptanceRate' => $this->kpi($acceptanceRate, $prevSentForRate),
            'pipelineValue' => $this->kpi($pipelineValue, 0),
            'acceptedValue' => $this->kpi($acceptedValue, $acceptedValuePrev),
        ];
    }

    private function parseRange(string $range): int
    {
        return match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };
    }

    private function baseQuery()
    {
        $query = Quote::query()->where('company_id', $this->company->id);

        if ($this->user !== null) {
            $query->where('created_by', $this->user->id);
        }

        return $query;
    }

    private function kpi(mixed $value, mixed $previousValue): array
    {
        $deltaPercent = null;

        if ($previousValue !== 0 && $previousValue !== null) {
            $deltaPercent = round(((float) $value - (float) $previousValue) / (float) $previousValue * 100, 2);
        }

        return [
            'value' => $value,
            'previousValue' => $previousValue,
            'deltaPercent' => $deltaPercent,
        ];
    }
}