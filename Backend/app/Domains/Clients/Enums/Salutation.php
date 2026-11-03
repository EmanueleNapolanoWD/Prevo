<?php

namespace App\Domains\Clients\Enums;

enum Salutation: string
{
    case MR = 'Sig.';
    case MRS = 'Sig.ra';
    case COUPLE = 'Coniugi';
    case FAMILY = 'Famiglia';

    public function label(): string
    {
        return match ($this) {
            self::MR => 'Sig.',
            self::MRS => 'Sig.ra',
            self::COUPLE => 'Coniugi',
            self::FAMILY => 'Famiglia',
        };
    }
}