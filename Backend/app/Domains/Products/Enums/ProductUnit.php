<?php

namespace App\Domains\Products\Enums;

enum ProductUnit: string
{
    case Piece = 'pz';
    case Meter = 'm';
    case SquareMeter = 'm2';
    case CubicMeter = 'm3';
    case Kilogram = 'kg';
    case Liter = 'l';
    case Hour = 'h';
    case Day = 'gg';
    case Lumpsum = 'forfait';

    /** Etichetta mostrata nell'interfaccia. */
    public function label(): string
    {
        return match ($this) {
            self::Piece => 'Pezzo',
            self::Meter => 'Metro',
            self::SquareMeter => 'Metro quadro',
            self::CubicMeter => 'Metro cubo',
            self::Kilogram => 'Chilogrammo',
            self::Liter => 'Litro',
            self::Hour => 'Ora',
            self::Day => 'Giorno',
            self::Lumpsum => 'A corpo',
        };
    }

    /** Elenco dei valori, utile per le regole di validazione. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Elenco [value, label] da esporre al frontend per la tendina. */
    public static function options(): array
    {
        return array_map(
            fn (self $unit) => ['value' => $unit->value, 'label' => $unit->label()],
            self::cases(),
        );
    }
}