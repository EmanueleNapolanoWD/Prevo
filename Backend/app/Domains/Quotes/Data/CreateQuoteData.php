<?php

namespace App\Domains\Quotes\Data;

use App\Domains\Quotes\Supports\Money;
use Carbon\CarbonImmutable;

final readonly class CreateQuoteData
{
    public function __construct(
        public string $clientId,
        public string $title,
        public ?string $description,
        public ?CarbonImmutable $validUntil,
        public ?float $vatRate,
        public int $surchargeCents,
        public ?string $discountType,   // 'percentage' | 'fixed' | null
        public ?float $discountValue,   // % se percentage, euro se fixed
        public array $items,
        public array $appearance,
        public ?array $contact,
        public ?string $notes,
        public ?string $terms,
    ) {
    }

    public static function fromArray(array $v): self
    {
        $discountValue = isset($v['discount_value']) ? (float) $v['discount_value'] : null;

        // Senza tipo o con valore 0 lo sconto non esiste: entrambi null.
        // Così, in modifica, uno sconto rimosso dal form viene azzerato nel DB.
        $hasDiscount = !empty($v['discount_type']) && $discountValue !== null && $discountValue > 0;

        return new self(
            clientId: (string) $v['client_id'],
            title: trim((string) $v['title']),
            description: $v['description'] ?? null,
            validUntil: isset($v['valid_until']) ? CarbonImmutable::parse($v['valid_until']) : null,
            vatRate: isset($v['vat_rate']) ? (float) $v['vat_rate'] : null,
            surchargeCents: Money::toCents($v['surcharge'] ?? 0),
            discountType: $hasDiscount ? (string) $v['discount_type'] : null,
            discountValue: $hasDiscount ? $discountValue : null,
            items: array_map(QuoteItemData::fromArray(...), array_values($v['items'])),
            appearance: $v['appearance'] ?? [],
            contact: $v['contact'] ?? null,
            notes: $v['notes'] ?? null,
            terms: $v['terms'] ?? null,
        );
    }

    /** Sconto fisso in centesimi; 0 se lo sconto è assente o percentuale. */
    public function discountFixedCents(): int
    {
        return $this->discountType === 'fixed'
            ? Money::toCents($this->discountValue ?? 0)
            : 0;
    }
}