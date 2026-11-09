<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Ai\Agents\QuoteDraftAgent;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use App\Domains\Quotes\Data\QuoteItemData;
use App\Domains\Quotes\Supports\QuoteNumberGenerator;
use App\Domains\Quotes\Supports\QuoteTotalsCalculator;

final class GenerateQuoteDraftAction
{
    private const DEFAULT_VAT = 22.0; // TODO: dalle impostazioni azienda
    private const DEFAULT_UNIT = 'pz'; // TODO: unità di default usata dal form

    public function __construct(
        private QuoteTotalsCalculator $calculator,
        private QuoteNumberGenerator $numberGenerator,
    ) {
    }

    /**
     * Genera una bozza di preventivo (NON salvata) a partire da una richiesta testuale.
     *
     * @return array<string, mixed>
     */
    public function handle(Company $company, string $prompt): array
    {
        $company = $company->loadMissing('quoteSettings');

        $settings = $company->quoteSettings;

        $defaultVatRate = (float) ($settings?->default_vat_rate ?? 22);
        $defaultValidityDays = (int) ($settings?->default_validity_days ?? 30);

        $response = QuoteDraftAgent::make(company: $company)->prompt($prompt);

        // Prodotti citati dal modello: solo quelli di questa azienda
        $products = Product::query()
            ->where('company_id', $company->id)
            ->whereIn('id', collect($response['items'])->pluck('product_id')->filter()->unique()->values())
            ->get()
            ->keyBy('id');

        $dtos = [];
        $lines = [];

        foreach ($response['items'] as $row) {
            $product = $products->get($row['product_id'] ?? null);

            // Se la voce è nel listino con un prezzo, il prezzo lo decide il DB, non il modello
            $unitPriceCents = ($product && $product->sale_price !== null)
                ? (int) round(((float) $product->sale_price) * 100)
                : (int) round(((float) $row['unit_price']) * 100);

            $vatRate = $product?->vat_rate !== null
                ? (float) $product->vat_rate
                : (isset($row['vat_rate']) ? (float) $row['vat_rate'] : null);

            $name = $this->clean($row['name'] ?? $row['description'] ?? '');
            $description = $this->clean($row['description'] ?? $row['name'] ?? '');
            $quantity = (float) $row['quantity'];

            $dtos[] = new QuoteItemData(
                name: $name,
                description: $description,
                quantity: $quantity,
                unitPriceCents: $unitPriceCents,
                unit: self::DEFAULT_UNIT,
                vatRate: $vatRate,
                discountType: null,
                discountValue: 0.0,
                productId: $product?->id,
            );

            $lines[] = [
                'name' => $name,
                'description' => $description,
                'quantity' => $quantity,
                'unit_price_cents' => $unitPriceCents,
                'vat_rate' => $vatRate,
                'product_id' => $product?->id,
            ];
        }

        $totals = $this->calculator->calculate(
            items: $dtos,
            surchargeCents: 0,
            defaultVatRate: $defaultVatRate,
            pricesIncludesVat: false,
            globalDiscountType: null,
            globalDiscountValue: 0,
        );

        $clientName = $this->clean((string) ($response['client_name'] ?? ''));

        $client = $this->findClient($company, $clientName);

        return [
            'number' => $settings
                ? $this->numberGenerator->preview($settings)
                : null,
            'title' => $this->clean($response['title']),
            'description' => $this->clean($response['description']),
            'notes' => $this->clean($response['notes'] ?? null) ?: null,
            'valid_days' => $response['valid_days'] ?? $defaultValidityDays,

            'client_id' => $client?->id,
            'client_name' => $clientName ?: null,
            'client' => $client,

            'items' => $lines,

            'totals' => [
                'subtotal' => $totals->subtotal,
                'discount_total' => $totals->discountTotal,
                'surcharge' => $totals->surcharge,
                'taxable_amount' => $totals->taxableAmount,
                'tax_total' => $totals->taxTotal,
                'total' => $totals->total,
            ],
        ];
    }

    /** Cerca il cliente nell'azienda; restituisce l'id solo se la corrispondenza è univoca. */
    private function findClient(Company $company, ?string $name): ?Client
    {
        $terms = preg_split('/\s+/', (string) $name, -1, PREG_SPLIT_NO_EMPTY);

        if (empty($terms)) {
            return null;
        }

        $matches = Client::query()
            ->where('company_id', $company->id)
            ->where(function ($query) use ($terms) {
                foreach ($terms as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';

                    $query->where(fn($q) => $q
                        ->where('name', 'like', $like)
                        ->orWhere('surname', 'like', $like));
                }
            })
            ->with(['emails', 'phones', 'addresses'])
            ->limit(2)
            ->get();

        return $matches->count() === 1
            ? $matches->first()
            : null;
    }

    /** Il modello a volte usa trattini non separabili (U+2010/U+2011). */
    private function clean(?string $text): ?string
    {
        return $text === null
            ? null
            : trim(str_replace(["\u{2010}", "\u{2011}"], '-', $text));
    }
}