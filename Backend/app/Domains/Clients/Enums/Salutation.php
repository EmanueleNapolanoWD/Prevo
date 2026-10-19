<?php

namespace App\Domains\Clients\Enums;

enum Salutation: string
{
    case MR = 'MR';
    case MRS = 'MRS';
    case COUPLE = 'COUPLE';
    case FAMILY = 'FAMILY';

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