<?php

namespace App\Domains\Companies\Enums;

enum CompanyStatus: string
{
    case Trial = 'trial';
    case Active = 'active';
    case Suspended = 'suspended';
}