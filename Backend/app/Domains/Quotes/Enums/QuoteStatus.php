<?php

namespace App\Domains\Quotes\Enums;

enum QuoteStatus: string
{
    case Draft = 'DRAFT';
    case Sent = 'SENT';
    case Accepted = 'ACCEPTED';
    case Rejected = 'REJECTED';
    case Expired = 'EXPIRED';
}