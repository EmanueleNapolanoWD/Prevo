<?php

namespace App\Domains\Quotes\Data;

use App\Domains\Quotes\Enums\DiscountType;
use App\Domains\Quotes\Supports\Money;

final class QuoteItemData
{
    public function __construct(
        public string $description,
        public float $quantity,
        public int $unitPriceCents,
        public string $unit = 'pz',
        public ?float $vatRate = null,
        public ?DiscountType $discountType = null,
        public ?float $discountValue = null,
        public ?string $productId,
    ) {
    }

    public static function fromArray(array $v): self
    {
        return new self(
            description: trim((string) $v['description']),
            quantity: (float) $v['quantity'],
            unitPriceCents: Money::toCents($v['unit_price']),
            unit: $v['unit'] ?? 'pz',
            vatRate: isset($v['vat_rate']) ? (float) $v['vat_rate'] : null,
            discountType: isset($v['discount_type']) ? DiscountType::from(strtoupper($v['discount_type'])) : null,
            discountValue: (float) ($v['discount_value'] ?? 0),
            productId: $v['product_id'] ?? null,
        );
    }
}