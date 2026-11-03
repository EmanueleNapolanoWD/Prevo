<?php

namespace App\Domains\Quotes\Enums;

enum QuoteStatus: string
{
    case Draft = 'DRAFT';
    case Sent = 'SENT';
    case Accepted = 'ACCEPTED';
    case Rejected = 'REJECTED';
    case Expired = 'EXPIRED';

    public function isEditable(): bool
    {
        return in_array($this, [self::Draft, self::Sent], true);
    }

    public function isDeletable(): bool
    {
        return $this === self::Draft;
    }
}