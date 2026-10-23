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
        public float $vatRate,
        public int $surchargeCents,
        public array $items,
        public array $appearance,
        public ?array $contact,
        public ?string $notes,
        public ?string $terms,

    ) {
    }

    public static function fromArray(array $v): self
    {
        return new self(
            clientId: (string) $v['client_id'],
            title: trim((string) $v['title']),
            description: $v['description'] ?? null,
            validUntil: isset($v['valid_until']) ? CarbonImmutable::parse($v['valid_until']) : null,
            vatRate: isset($v['vat_rate']) ? (float) $v['vat_rate'] : null,
            surchargeCents: Money::toCents($v['surcharge'] ?? 0),
            items: array_map(QuoteItemData::fromArray(...), array_values($v['items'])),
            appearance: $v['appearance'] ?? [],
            contact: $v['contact'] ?? null,
            notes: $v['notes'] ?? null,
            terms: $v['terms'] ?? null,
        );

    }


}

