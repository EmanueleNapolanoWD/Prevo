<?php

namespace App\Domains\Clients\Models;

use App\Domains\Clients\Enums\ClientType;
use App\Domains\Clients\Enums\Salutation;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'type',
        'salutation',
        'name',
        'surname',
        'company_name',
        'pec',
        'website',
        'country_code',
        'tax_code',
        'vat_number',
        'sdi_code',
        'default_vat_rate',
        'is_piblic_administration',
        'payment_terms',
        'note',
    ];

    protected $attributes = [
        'country_code' => 'IT',
        'is_public_administration' => false
    ];

    protected function casts(): array
    {
        return [
            'type' => ClientType::class,
            'salutation' => Salutation::class,
            'default_vat_rate' => 'decimal:2',
            'is_public_administration' => 'boolean'
        ];
    }

    /* |-------------------------------------------------------------------------- | EVENTS |-------------------------------------------------------------------------- */

    protected static function booted(): void
    {
        //display name è coerente con nome,cognome e ragione social
        static::saving(function (Client $client) {
            $client->display_name = $client->computeDisplayName();
        });
    }

    public function computedDisplayName(): string
    {
        if ($this->type === ClientType::COMPANY) {
            return trim((string) $this->company_name);
        }

        return trim("{$this->surname} {$this->name}");
    }

    /* |-------------------------------------------------------------------------- | MUTATOR |-------------------------------------------------------------------------- */

    protected function pec(): Attribute
    {
        return Attribute::make(set: fn(?string $v) => $v ? mb_strtolower(trim($v)) : null);
    }

    protected function countryCode(): Attribute
    {
        return Attribute::make(set: fn(string $v) => strtoupper(trim($v)));
    }

    protected function taxCode(): Attribute
    {
        return Attribute::make(set: fn(?string $v) => $v ? strtoupper(preg_replace('/\s+/', '', $v)) : null);
    }

    protected function vatNumber(): Attribute
    {
        // solo cifre/lettere, senza spazi né prefisso paese
        return Attribute::make(set: fn(?string $v) => $v ? preg_replace('/[^A-Za-z0-9]/', '', $v) : null);
    }

    protected function sdiCode(): Attribute
    {
        return Attribute::make(set: fn(?string $v) => $v ? strtoupper(trim($v)) : null);
    }


    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    // Collegamento con il modello Company
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(ClientEmail::class);
    }

    public function primaryEmail(): HasOne
    {
        return $this->hasOne(ClientEmail::class)->where('is_primary', true);
    }

    public function phones(): HasMany
    {
        return $this->hasMany(ClientPhone::class);
    }

    public function primaryPhone(): HasOne
    {
        return $this->hasOne(ClientPhone::class)->where('is_primary', true);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(ClientAddress::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            ClientGroup::class,
            'client_client_group',
            'client_id',
            'client_group_id',
        );
    }


    // Collegamento con il modello Quote
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }


    /*
   |--------------------------------------------------------------------------
   | SCOPE
   |--------------------------------------------------------------------------
   */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        // escape dei caratteri jolly di LIKE
        $like = '%' . addcslashes($term, '%_\\') . '%';

        return $query->where(function (Builder $q) use ($like) {
            $q->where('display_name', 'like', $like)
                ->orWhere('vat_number', 'like', $like)
                ->orWhere('tax_code', 'like', $like)
                ->orWhereHas('emails', fn(Builder $e) => $e->where('email', 'like', $like))
                ->orWhereHas('phones', fn(Builder $p) => $p->where('phone', 'like', $like));
        });
    }
}
