<?php

namespace App\Domains\Clients\Enums;

enum AddressType: string
{
    case BILLING = 'BILLING';   // sede legale / fatturazione
    case SHIPPING = 'SHIPPING'; // spedizione
    case SITE = 'SITE';         // cantiere / luogo dell'intervento

    public function label(): string
    {
        return match ($this) {
            self::BILLING => 'Fatturazione',
            self::SHIPPING => 'Spedizione',
            self::SITE => 'Cantiere',
        };
    }
}