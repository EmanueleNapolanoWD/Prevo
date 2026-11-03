<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Data;

/**
 * Importi in centesimi.
 *  subtotal       = somma righe LORDE (quantità x prezzo, prima degli sconti)
 *  discountTotal  = somma sconti di riga
 *  taxableAmount  = subtotal - discountTotal + surcharge
 *  total          = taxableAmount + taxTotal
 */
final readonly class QuoteTotals
{
    /** @param list<CalculatedLine> $lines */
    public function __construct(
        public array $lines,
        public int $subtotal,
        public int $discountTotal,
        public int $surcharge,
        public int $taxableAmount,
        public int $taxTotal,
        public int $total,
    ) {}
}