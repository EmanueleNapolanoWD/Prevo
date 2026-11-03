<?php 

namespace App\Domains\Quotes\Enums;

enum QuoteTemplate: string
{
    case Classic = 'classic';
    case Modern = 'modern';
    case Minimal = 'minimal';

    public function label(): string
    {
        return match ($this) {
            self::Classic => 'Classico',
            self::Modern => 'Moderno',
            self::Minimal => 'Minimale',
        };
    }

    /** Vista Blade usata per generare il PDF. */
    public function view(): string
    {
        return "quotes.templates.{$this->value}";
    }
}