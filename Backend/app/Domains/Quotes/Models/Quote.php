<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\QuoteItem;
use App\Domains\Quotes\Models\QuotePublicLink;
use App\Domains\Quotes\Models\QuoteStatusHistory;
use App\Domains\Quotes\Models\QuoteVersion;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use HasUuids, SoftDeletes;

    public const STATUS_DRAFT = 'DRAFT';

    protected $fillable = [
        'company_id',
        'client_id',
        'created_by',
        'template',
        'primary_color',
        'accent_color',
        'number',
        'version',
        'status',
        'title',
        'description',
        'notes',
        'terms',
        'currency',
        'vat_rate',
        'contact_email',
        'contact_phone',
        'contact_address',
        'client_snapshot',
        'subtotal',
        'discount_total',
        'surcharge',
        'taxable_amount',
        'tax_total',
        'total',
        'valid_until',
        'send_at',
        'viewed_at',
        'accepted_at',
        'rejected_at',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'status' => QuoteStatus::class,
            'client_snapshot' => 'array',

            'vat_rate' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'surcharge' => 'decimal:2',
            'taxable_amount' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',

            'valid_until' => 'datetime',
            'send_at' => 'datetime',
            'viewed_at' => 'datetime',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSOR
    |--------------------------------------------------------------------------
    */

    // Colore del testo leggibile sopra il colore primario (bianco o quasi nero)
    protected function textOnPrimary(): Attribute
    {
        return Attribute::get(fn () => self::contrastColor($this->primary_color));
    }

    // Stesso calcolo per il colore di accento
    protected function textOnAccent(): Attribute
    {
        return Attribute::get(fn () => self::contrastColor($this->accent_color));
    }

    private static function contrastColor(?string $hex): string
    {
        $rgb = sscanf((string) $hex, '#%02x%02x%02x');

        // colore non valido: valore sicuro su sfondo scuro
        if (count(array_filter($rgb, fn ($v) => $v !== null)) < 3) {
            return '#FFFFFF';
        }

        [$r, $g, $b] = $rgb;

        return (0.299 * $r + 0.587 * $g + 0.114 * $b) > 160 ? '#111827' : '#FFFFFF';
    }

    /*
    |--------------------------------------------------------------------------
    | RELAZIONI
    |--------------------------------------------------------------------------
    */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    // Creatore del preventivo
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Righe del preventivo, nell'ordine scelto dall'utente
    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class)->orderBy('sort_order');
    }

    // Storico dei cambi di stato, dal più recente
    public function statusHistory(): HasMany
    {
        return $this->hasMany(QuoteStatusHistory::class)->latest();
    }

    // Versioni salvate (snapshot), dalla più recente
    public function versions(): HasMany
    {
        return $this->hasMany(QuoteVersion::class)->orderByDesc('version_number');
    }

    // Link pubblici di condivisione
    public function publicLinks(): HasMany
    {
        return $this->hasMany(QuotePublicLink::class);
    }
}