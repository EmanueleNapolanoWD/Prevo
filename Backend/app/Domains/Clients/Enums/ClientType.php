<?php

namespace App\Domains\Clients\Enums;

enum ClientType: string
{
    case PERSON = 'PERSON';
    case COMPANY = 'COMPANY';

    public function label(): string
    {
        return match ($this) {
            self::PERSON => 'Persona',
            self::COMPANY => 'Azienda'
        };
    }
}