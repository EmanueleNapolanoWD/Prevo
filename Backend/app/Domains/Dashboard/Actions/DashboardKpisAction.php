<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardKpisAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null
    ) {
    }

    public function execute(
        string $range = '30d',
    ): array {
        $days = $this->parseRange($range);

        $now = CarbonImmutable::now(config('app.timezone'));

        // periodo corrente: ultimi N giorni, corrente incluso
        $start = $now->subDays($days - 1)->startOfDay();
        $end = $now->endOfDay();

        $prevStart = $start->subDays($days);
        $prevEnd = $start->subSecond();


        // Preventivi inviati
        $quoteSent = $this->countSent($start, $end);
        $quoteSentPrev = $this->countSent($prevStart, $prevEnd);

        $acceptanceRate = $this->acceptedRate($start, $end);
        $acceptanceRatePrev = $this->acceptedRate($prevStart, $prevEnd);

        $acceptedValue = $this->acceptedValue($start, $end);
        $acceptedValuePrev = $this->acceptedValue($prevStart, $prevEnd);

        //snapshot
        $pipelineValue = (float) $this->baseQuery()
            ->whereIn('status', [QuoteStatus::Sent, QuoteStatus::Viewed])
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', $now->startOfDay());
            })->sum('total');

        return [
            'quoteSent' => $this->kpi($quoteSent, $quoteSentPrev),
            'acceptanceRate' => $this->kpi($acceptanceRate, $acceptanceRatePrev),
            'pipelineValue' => $this->kpi($pipelineValue, null),
            'acceptedValue' => $this->kpi($acceptedValue, $acceptedValuePrev),
        ];
    }

    // HELPERS
    private function countSent(CarbonImmutable $from, CarbonImmutable $to): int
    {
        return $this->baseQuery()->whereBetween('send_at', [$from, $to])->count();
    }

    private function acceptedRate(
        CarbonImmutable $from,
        CarbonImmutable $to
    ): float {
        $accepted = $this->baseQuery()->whereBetween('accepted_at', [$from, $to])->count();
        $rejected = $this->baseQuery()->whereBetween('rejected_at', [$from, $to])->count();
        $expired = $this->baseQuery()->where('status', QuoteStatus::Expired)
            ->whereBetween('valid_until', [$from, $to])
            ->count();

        $decided = $accepted + $rejected + $expired;

        return $decided > 0 ? round($accepted / $decided * 100, 1) : 0.0;
    }

    private function acceptedValue(CarbonImmutable $from, CarbonImmutable $to): float
    {
        return (float) $this->baseQuery()->whereBetween('accepted_at', [$from, $to])->sum('total');
    }

    private function parseRange(string $range): int
    {
        return match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };
    }

    private function baseQuery(): Builder
    {
        $query = Quote::query()
            ->where('company_id', $this->company->id);

        if ($this->user !== null) {
            $query->where('created_by', $this->user->id);
        }

        return $query;
    }

    private function kpi(int|float $value, int|float|null $previous): array
    {
        $deltaPercent = ($previous !== null && (float) $previous > 0.0)
            ? round(((float) $value - (float) $previous) / (float) $previous * 100, 1)
            : null;

        return [
            'value' => $value,
            'previousValue' => $previous,
            'deltaPercent' => $deltaPercent,
        ];
    }
}