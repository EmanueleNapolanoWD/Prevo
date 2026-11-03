<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;

class DashboardChartAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null,
    ) {
    }

    public function execute(string $range = '30d'): array
    {
        $days = $this->parseRange($range);
        $isWeekly = $days >= 90;

        $now = CarbonImmutable::now()->endOfDay();
        $start = $now->copy()->subDays($days)->startOfDay();

        $base = Quote::query()->where('company_id', $this->company->id);

        if ($this->user !== null) {
            $base->where('created_by', $this->user->id);
        }

        // Recupera tutti i preventivi rilevanti nel periodo con le date necessarie
        $quotes = $base
            ->whereBetween('send_at', [$start, $now])
            ->orWhereBetween('accepted_at', [$start, $now])
            ->get();

        // Costruisci una mappa data -> [sentValue, acceptedValue]
        $period = CarbonPeriod::create($start->startOfDay(), '1 day', $now->startOfDay());
        $data = [];

        foreach ($period as $day) {
            $key = $isWeekly ? $day->format('Y-\\W\\V') : $day->format('Y-m-d');
            $data[$key] = [
                'date' => $day->format('Y-m-d'),
                'sentValue' => 0,
                'acceptedValue' => 0,
            ];
        }

        foreach ($quotes as $quote) {
            $sentAt = $quote->send_at;
            $acceptedAt = $quote->accepted_at;

            if ($sentAt instanceof CarbonImmutable && $sentAt >= $start && $sentAt <= $now) {
                $key = $isWeekly ? $sentAt->format('Y-\\W\\V') : $sentAt->format('Y-m-d');
                if (isset($data[$key])) {
                    $data[$key]['sentValue'] += (float) $quote->total;
                }
            }

            if ($acceptedAt instanceof CarbonImmutable && $acceptedAt >= $start && $acceptedAt <= $now) {
                $key = $isWeekly ? $acceptedAt->format('Y-\\W\\V') : $acceptedAt->format('Y-m-d');
                if (isset($data[$key])) {
                    $data[$key]['acceptedValue'] += (float) $quote->total;
                }
            }
        }

        return array_values($data);
    }

    private function parseRange(string $range): int
    {
        return match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };
    }
}