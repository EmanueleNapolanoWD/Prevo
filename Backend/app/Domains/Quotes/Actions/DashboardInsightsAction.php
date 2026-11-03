<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class DashboardInsightsAction
{
    public function __construct(
        private readonly Company $company,
        private readonly ?User $user = null,
    ) {
    }

    public function execute(string $range = '30d'): array
    {
        $days = $this->parseRange($range);
        $now = CarbonImmutable::now();
        $start = $now->copy()->subDays($days)->startOfDay();

        $base = Quote::query()->where('company_id', $this->company->id);

        if ($this->user !== null) {
            $base->where('created_by', $this->user->id);
        }

        $acceptedQuotes = $base
            ->whereBetween('accepted_at', [$start, $now])
            ->where('status', QuoteStatus::Accepted)
            ->with('client')
            ->get();

        $customersMap = [];

        foreach ($acceptedQuotes as $quote) {
            $client = $quote->client;
            $name = $client?->display_name ?? $client?->name ?? 'Cliente sconosciuto';
            $clientId = $client?->id ?? 'unknown';

            if (!isset($customersMap[$clientId])) {
                $customersMap[$clientId] = [
                    'name' => $name,
                    'acceptedValue' => 0,
                    'acceptedCount' => 0,
                ];
            }

            $customersMap[$clientId]['acceptedValue'] += (float) $quote->total;
            $customersMap[$clientId]['acceptedCount'] += 1;
        }

        $topCustomers = array_values($customersMap);
        usort($topCustomers, fn ($a, $b) => $b['acceptedValue'] <=> $a['acceptedValue']);
        $topCustomers = array_slice($topCustomers, 0, 5);

        return [
            'topCustomers' => array_map(fn ($c) => [
                'name' => $c['name'],
                'acceptedValue' => (float) $c['acceptedValue'],
                'acceptedCount' => $c['acceptedCount'],
            ], $topCustomers),
            'topCatalogItems' => $this->topCatalogItems($start, $now),
            'teamPerformance' => $this->teamPerformance($start, $now),
            'onboarding' => $this->onboardingChecklist(),
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

    private function topCatalogItems(CarbonImmutable $start, CarbonImmutable $now): array
    {
        $items = \App\Domains\Quotes\Models\QuoteItem::query()
            ->join('quotes', 'quote_items.quote_id', '=', 'quotes.id')
            ->where('quotes.company_id', $this->company->id)
            ->whereBetween('quotes.created_at', [$start, $now])
            ->leftJoin('products', 'quote_items.product_id', '=', 'products.id')
            ->select(
                'products.name as product_name',
                DB::raw('SUM(quote_items.quantity) as total_quantity'),
                DB::raw('COUNT(*) as times_used')
            )
            ->groupBy('products.name')
            ->orderByDesc('times_used')
            ->limit(5)
            ->get();

        return $items->map(function ($item) {
            return [
                'name' => $item->product_name ?? 'Voce personalizzata',
                'timesUsed' => (int) $item->times_used,
                'totalQuantity' => (float) $item->total_quantity,
            ];
        })->toArray();
    }

    private function teamPerformance(CarbonImmutable $start, CarbonImmutable $now): array
    {
        $users = $this->company->users()->with('companyUsers')->get();

        return $users->map(function ($user) use ($start, $now) {
            $quotes = Quote::query()
                ->where('company_id', $this->company->id)
                ->where('created_by', $user->id)
                ->whereBetween('created_at', [$start, $now])
                ->get();

            $created = $quotes->count();
            $sent = $quotes->where('status', QuoteStatus::Sent)->count();
            $accepted = $quotes->where('status', QuoteStatus::Accepted)->count();
            $rate = $created > 0 ? round(($accepted / $created) * 100, 2) : 0.0;

            $role = $user->companyUsers->first()?->pivot?->role ?? 'MEMBER';

            return [
                'id' => $user->id,
                'name' => $user->name . ' ' . $user->surname,
                'role' => $role,
                'created' => $created,
                'sent' => $sent,
                'accepted' => $accepted,
                'acceptanceRate' => $rate,
            ];
        })->toArray();
    }

    private function onboardingChecklist(): array
    {
        $settings = $this->company->quoteSettings;

        $hasTaxData = filled($this->company->vat_number) || filled($this->company->tax_code);
        $hasLogo = filled($this->company->logo_path);
        $hasDefaultVatRate = $settings?->default_vat_rate !== null && $settings->default_vat_rate > 0;
        $hasCatalogItem = \App\Domains\Products\Models\Product::query()
            ->where('company_id', $this->company->id)
            ->exists();
        $hasClient = \App\Domains\Clients\Models\Client::query()
            ->where('company_id', $this->company->id)
            ->exists();

        return [
            [
                'id' => 'company_tax_data',
                'label' => 'Dati fiscali azienda (P.IVA o C.F.)',
                'completed' => $hasTaxData,
            ],
            [
                'id' => 'company_logo',
                'label' => 'Logo aziendale',
                'completed' => $hasLogo,
            ],
            [
                'id' => 'default_vat_rate',
                'label' => 'Aliquota IVA predefinita',
                'completed' => $hasDefaultVatRate,
            ],
            [
                'id' => 'catalog_item',
                'label' => 'Almeno una voce di catalogo',
                'completed' => $hasCatalogItem,
            ],
            [
                'id' => 'client',
                'label' => 'Almeno un cliente',
                'completed' => $hasClient,
            ],
        ];
    }
}