<?php

namespace App\Domains\Quotes\Supports;

class Money
{

    /** Converte un importo in euro (es. 75, "75.50") in centesimi interi. */
    public static function toCents(int|float|string $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    /** Converte centesimi in stringa decimale per le colonne decimal(12,2): 21350 => "213.50". */
    public static function toDecimal(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }

}