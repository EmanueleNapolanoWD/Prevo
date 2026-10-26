<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Quotes\Data\CalculatedLine;
use App\Domains\Quotes\Data\CreateQuoteData;
use App\Domains\Quotes\Enums\DiscountType;
use App\Domains\Quotes\Models\Quote;
use App\Domains\Quotes\Models\QuoteVersion;
use App\Domains\Quotes\Supports\Money;
use App\Domains\Quotes\Supports\QuoteTotalsCalculator;
use DomainException;
use Illuminate\Support\Facades\DB;

class UpdateQuoteAction
{
    public function __construct(
        private readonly QuoteTotalsCalculator $calculator,
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(
        Quote $quote,
        $user,
        CreateQuoteData $data,
        ?int $expectedVersion = null,
    ): Quote {
        return DB::transaction(function () use ($quote, $user, $data, $expectedVersion) {
            // -----------------------------------------------------------------
            // 1. Lock della riga e controlli
            // -----------------------------------------------------------------
            $quote = Quote::query()
                ->whereKey($quote->getKey())
                ->lockForUpdate()
                ->with('items')
                ->firstOrFail();

            $this->assertEditable($quote, $expectedVersion);

            // -----------------------------------------------------------------
            // 2. Snapshot PRIMA della modifica (storico versioni)
            // -----------------------------------------------------------------
            $before = $this->snapshot($quote);

            $nextVersion = ((int) $quote->versions()->max('version_number')) + 1;

            QuoteVersion::create([
                'quote_id' => $quote->id,
                'version_number' => $nextVersion,
                'snapshot' => $before,
                'created_by' => $user->id,
            ]);

            // -----------------------------------------------------------------
            // 3. Calcolo totali (prima di scrivere, così righe e totali
            //    vengono salvati insieme)
            // -----------------------------------------------------------------
            $vatRate = $data->vatRate ?? (float) $quote->vat_rate;

            $totals = $this->calculator->calculate(
                items: $data->items,
                surchargeCents: $data->surchargeCents,
                defaultVatRate: $vatRate,
                pricesIncludesVat: (bool) ($quote->prices_include_vat ?? false), // ADATTA
                globalDiscountType: $data->discountType
                ? DiscountType::from($data->discountType)
                : null,
                globalDiscountValue: (float) ($data->discountValue ?? 0),
            );

            // -----------------------------------------------------------------
            // 4. Aggiornamento campi e totali
            // -----------------------------------------------------------------
            $quote->fill([
                'client_id' => $data->clientId,
                'title' => $data->title,
                'description' => $data->description,
                'valid_until' => $data->validUntil,
                'discount_type' => $data->discountType,    // null se rimosso
                'discount_value' => $data->discountValue,   // null se rimosso
                'notes' => $data->notes,
                'terms' => $data->terms,
                'contact' => $data->contact,
                'appearance' => $data->appearance,

                // totali (ADATTA: nomi e unità delle colonne)
                'subtotal' => Money::toDecimal($totals->subtotal),
                'discount_total' => Money::toDecimal($totals->discountTotal),
                'surcharge' => Money::toDecimal($totals->surcharge),
                'taxable_amount' => Money::toDecimal($totals->taxableAmount),
                'tax_total' => Money::toDecimal($totals->taxTotal),
                'total' => Money::toDecimal($totals->total),
            ]);

            $fieldChanges = $this->diffAttributes($quote);

            // -----------------------------------------------------------------
            // 5. Sostituzione righe (lo snapshot conserva le vecchie)
            // -----------------------------------------------------------------
            $quote->items()->delete();

            foreach ($totals->lines as $line) {
                $quote->items()->create($this->lineAttributes($line));
            }

            $quote->version = $quote->version + 1;
            $quote->save();

            // -----------------------------------------------------------------
            // 6. Audit
            // -----------------------------------------------------------------
            $quote->load('items');
            $after = $this->snapshot($quote);

            $this->audit->log(
                event: 'quote.updated',
                user: $user,
                company: $quote->company,
                auditable: $quote,
                old: $before,
                new: $after,
                metadata: [
                    'from_version' => $quote->version - 1,
                    'to_version' => $quote->version,
                    'fields' => $fieldChanges,
                    'items' => $this->diffItems($before['items'], $after['items']),
                ],
            );

            return $quote->fresh(['client.emails', 'client.phones', 'client.addresses', 'items']);
        });
    }

    // =========================================================================
    // Controlli
    // =========================================================================

    private function assertEditable(Quote $quote, ?int $expectedVersion): void
    {
        if (!$quote->status->isEditable()) {
            throw new DomainException('Il preventivo non è più modificabile.');
        }

        if ($expectedVersion !== null && $expectedVersion !== (int) $quote->version) {
            throw new DomainException(
                'Il preventivo è stato modificato da un altro utente. Ricarica la pagina.'
            );
        }
    }

    // =========================================================================
    // Righe
    // =========================================================================

    /** ADATTA ai nomi delle colonne di quote_items. */
    private function lineAttributes(CalculatedLine $line): array
    {
        return [
            'sort_order' => $line->sortOrder,
            'product_id' => $line->productId,
            'description' => $line->description,
            'unit' => $line->unit,
            'quantity' => $line->quantity,

            'unit_price' => Money::toDecimal($line->unitPriceCents),

            'discount_type' => $line->discountType,
            'discount_value' => $line->discountValue,
            'vat_rate' => $line->vatRate,

            'subtotal' => Money::toDecimal($line->subtotalCents),
            'tax_amount' => Money::toDecimal($line->taxCents),
            'total' => Money::toDecimal($line->totalCents),
        ];
    }

    // =========================================================================
    // Snapshot e differenze
    // =========================================================================

    private function snapshot(Quote $quote): array
    {
        return [
            ...$quote->only([
                'number',
                'version',
                'status',
                'client_id',
                'title',
                'description',
                'valid_until',
                'vat_rate',
                'surcharge',
                'discount_type',
                'discount_value',
                'notes',
                'terms',
                'contact',
                'appearance',
                'subtotal',
                'discount_total',
                'taxable_amount',
                'tax_total',
                'total',
            ]),
            'items' => $quote->items
                ->sortBy('sort_order')
                ->map(fn($i) => $i->only([
                    'product_id',
                    'description',
                    'unit',
                    'quantity',
                    'unit_price',
                    'vat_rate',
                    'discount_type',
                    'discount_value',
                    'subtotal',
                    'tax_amount',
                    'total',
                    'sort_order',
                ]))
                ->values()
                ->all(),
        ];
    }

    /** @return array<string, array{old: mixed, new: mixed}> */
    private function diffAttributes(Quote $quote): array
    {
        $diff = [];
        foreach ($quote->getDirty() as $key => $new) {
            $diff[$key] = ['old' => $quote->getOriginal($key), 'new' => $new];
        }
        return $diff;
    }

    private function diffItems(array $old, array $new): array
    {
        $changed = [];
        $max = max(count($old), count($new));

        for ($i = 0; $i < $max; $i++) {
            $o = $old[$i] ?? null;
            $n = $new[$i] ?? null;

            if ($o === null) {
                $changed[] = ['position' => $i, 'type' => 'added', 'new' => $n];
            } elseif ($n === null) {
                $changed[] = ['position' => $i, 'type' => 'removed', 'old' => $o];
            } elseif ($this->itemCore($o) !== $this->itemCore($n)) {
                $changed[] = ['position' => $i, 'type' => 'changed', 'old' => $o, 'new' => $n];
            }
        }

        return $changed;
    }

    private function itemCore(array $item): array
    {
        return [
            $item['product_id'] ?? null,
            $item['description'] ?? null,
            $item['unit'] ?? null,
            (string) ($item['quantity'] ?? 0),
            (int) ($item['unit_price'] ?? 0),
            $item['vat_rate'] ?? null,
            $item['discount_type'] ?? null,
            (string) ($item['discount_value'] ?? 0),
        ];
    }
}