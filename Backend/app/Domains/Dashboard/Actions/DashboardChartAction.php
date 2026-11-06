<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;

class DashboardChartAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null, // null = vista OWNER
    ) {}

    public function execute(string $range = '30d'): array
    {
        $days = $this->parseRange($range);
        $weekly = $days >= 90;

        $now = CarbonImmutable::now(config('app.timezone'));
        $end = $now->endOfDay();
        $start = $now->subDays($days - 1)->startOfDay();

        // Chiave del bucket: giorno oppure lunedì della settimana
        $bucketKey = static function (DateTimeInterface $date) use ($weekly): string {
            $d = CarbonImmutable::instance($date);

            return ($weekly ? $d->startOfWeek(CarbonInterface::MONDAY) : $d)->toDateString();
        };

        // Bucket precompilati a zero, così i giorni senza dati compaiono comunque
        $buckets = [];
        foreach (CarbonPeriod::create($start, '1 day', $end->startOfDay()) as $day) {
            $key = $bucketKey($day);
            $buckets[$key] ??= ['date' => $key, 'sentValue' => 0.0, 'acceptedValue' => 0.0];
        }

        $quotes = $this->baseQuery()
            ->where(function (Builder $q) use ($start, $end) {
                $q->whereBetween('send_at', [$start, $end])
                    ->orWhereBetween('accepted_at', [$start, $end]);
            })
            ->get(['id', 'total', 'send_at', 'accepted_at']);

        foreach ($quotes as $quote) {
            $total = (float) $quote->total;

            $sentAt = $quote->send_at;
            if ($sentAt !== null && $sentAt >= $start && $sentAt <= $end) {
                $key = $bucketKey($sentAt);
                if (isset($buckets[$key])) {
                    $buckets[$key]['sentValue'] += $total;
                }
            }

            $acceptedAt = $quote->accepted_at;
            if ($acceptedAt !== null && $acceptedAt >= $start && $acceptedAt <= $end) {
                $key = $bucketKey($acceptedAt);
                if (isset($buckets[$key])) {
                    $buckets[$key]['acceptedValue'] += $total;
                }
            }
        }

        return array_values(array_map(static fn (array $b): array => [
            'date' => $b['date'],
            'sentValue' => round($b['sentValue'], 2),
            'acceptedValue' => round($b['acceptedValue'], 2),
        ], $buckets));
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
        $query = Quote::query()->where('company_id', $this->company->id);

        if ($this->user !== null) {
            $query->where('created_by', $this->user->id);
        }

        return $query;
    }
}