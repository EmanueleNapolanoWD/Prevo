<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteTemplate;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteSettings extends Model
{
    use HasUuids;

    protected $table = 'quote_settings';

    protected $fillable = [
        'company_id',

        //template
        'default_quote_template',
        'quote_primary_color',
        'quote_accent_color',

        // Numerazione preventivi
        'quote_prefix',
        'quote_start_number',
        'next_quote_number',
        'quote_number_resets_yearly',
        'quote_number_padding',

        // Fiscale / importi
        'default_vat_rate',
        'default_vat_nature',
        'prices_include_vat',
        'stamp_duty_enabled',
        'default_currency',

        // Condizioni commerciali
        'default_validity_days',
        'default_payment_terms',
        'default_payment_method',
        'default_notes',
        'default_terms',

        // Localizzazione
        'locale',
        'timezone',
        'date_format',
    ];

    /** Stessi default della migration, così un model appena creato ha già i valori giusti. */
    protected $attributes = [
        'default_quote_template' => 'classic',
        'quote_primary_color' => '#1F2937',
        'quote_accent_color' => '#2563EB',
        'quote_prefix' => 'PREV',
        'quote_start_number' => 1,
        'next_quote_number' => 1,
        'quote_number_resets_yearly' => true,
        'quote_number_padding' => 4,
        'default_vat_rate' => 22.00,
        'prices_include_vat' => false,
        'stamp_duty_enabled' => false,
        'default_currency' => 'EUR',
        'default_validity_days' => 30,
        'locale' => 'it',
        'timezone' => 'Europe/Rome',
        'date_format' => 'd/m/Y',
    ];

    protected function casts(): array
    {
        return [
            'default_quote_template' => QuoteTemplate::class,
            'quote_start_number' => 'integer',
            'next_quote_number' => 'integer',
            'quote_number_resets_yearly' => 'boolean',
            'quote_number_padding' => 'integer',
            'default_vat_rate' => 'decimal:2',
            'prices_include_vat' => 'boolean',
            'stamp_duty_enabled' => 'boolean',
            'default_validity_days' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZZAZIONE DATI (mutator)
    |--------------------------------------------------------------------------
    */
    protected function quotePrefix(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    protected function defaultCurrency(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    protected function defaultVatNature(): Attribute
    {
        return Attribute::make(set: fn(?string $value) => $value ? strtoupper(trim($value)) : null);
    }

    protected function quotePrimaryColor(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    protected function quoteAccentColor(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    /*
    |--------------------------------------------------------------------------
    | RELAZIONI
    |--------------------------------------------------------------------------
    */

    /** Azienda proprietaria delle impostazioni (1->1). */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}