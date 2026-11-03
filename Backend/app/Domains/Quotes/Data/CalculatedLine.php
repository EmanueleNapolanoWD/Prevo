<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Data;

use App\Domains\Quotes\Enums\DiscountType;
use App\Domains\Quotes\Supports\Money;

final readonly class CalculatedLine
{
    public function __construct(
        public int $sortOrder,
        public ?string $productId,
        public string $description,
        public string $unit,
        public float $quantity,
        public int $unitPriceCents,
        public ?DiscountType $discountType,
        public float $discountValue,
        public float $vatRate,
        public int $subtotalCents,   // imponibile di riga, al netto dello sconto
        public int $taxCents,
        public int $totalCents,
    ) {
    }

    /** @return array<string, mixed> Pronto per $quote->items()->create(). */
    public function toArray(): array
    {
        \Log::info($this->discountType?->value);
        \Log::info($this->discountType ? number_format($this->discountValue, 2, '.', '') : null);

        return [
            'product_id' => $this->productId,
            'description' => $this->description,
            'unit' => $this->unit,
            'quantity' => $this->quantity,
            'unit_price' => Money::toDecimal($this->unitPriceCents),
            'discount_type' => $this->discountType?->value,
            'discount_value' => $this->discountType ? number_format($this->discountValue, 2, '.', '') : null,
            'vat_rate' => number_format($this->vatRate, 2, '.', ''),
            'subtotal' => Money::toDecimal($this->subtotalCents),
            'tax_amount' => Money::toDecimal($this->taxCents),
            'total' => Money::toDecimal($this->totalCents),
            'sort_order' => $this->sortOrder,
        ];
    }
}