<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Enums;

enum DiscountType: string
{
    /** discount_value = percentuale (10 => 10%). */
    case Percentage = 'PERCENTAGE';

    /** discount_value = importo fisso in euro. */
    case Fixed = 'FIXED';
}