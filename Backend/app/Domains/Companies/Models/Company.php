<?php

namespace App\Domains\Companies\Models;

use App\Domains\Audit\Models\Audit;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Clients\Models\ClientGroup;
use App\Domains\Companies\Enums\CompanyStatus;
use App\Domains\Companies\Models\CompanySettings;
use App\Domains\Companies\Models\CompanyUser;
use App\Domains\Quotes\Models\Quote;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Multitenancy\Concerns\UsesMultitenancyConfig;
use Spatie\Multitenancy\Contracts\IsTenant;
use Spatie\Multitenancy\Models\Concerns\ImplementsTenant;

class Company extends Model implements IsTenant
{
    use HasUuids, ImplementsTenant, UsesMultitenancyConfig, SoftDeletes;

    protected $table = 'companies';

    protected $fillable = [
        //Anagrafica
        'name',
        'legal_name',
        'legal_form',
        'slug',

        //Dati Fiscali
        'country_code',
        'vat_number',
        'tax_code',
        'tax_regime',
        'sdi_code',
        'pec',
        'rea_office',
        'rea_number',
        'share_capital',
        'ateco_code',
        'iban',

        //sede legale
        'address',
        'postal_code',
        'city',
        'province',

        //Contatti
        'email',
        'phone',
        'website',
        'logo_path',

        //Stato 
        'status',
        'trial_ends_at'
    ];

    protected $attributes = [
        'country_code' => 'IT',
        'status' => 'trial'
    ];

    protected function casts(): array
    {
        return [
            'status' => CompanyStatus::class,
            'share_capital' => 'decimal:2',
            'trial_ends_at' => 'datetime'
        ];
    }

    /*
   |--------------------------------------------------------------------------
   | EVENTI
   |--------------------------------------------------------------------------
   */
    protected static function booted(): void
    {
        // Ogni azienda nasce con le sue impostazioni (usa i default della migration)
        static::created(function (Company $company) {
            $company->companySettings()->create();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZZAZIONE DATI (mutator)
    |--------------------------------------------------------------------------
    */
    protected function email(): Attribute
    {
        return Attribute::make(set: fn(string $value) => mb_strtolower(trim($value)));
    }

    protected function pec(): Attribute
    {
        return Attribute::make(set: fn(?string $value) => $value ? mb_strtolower(trim($value)) : null);
    }

    protected function province(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    protected function reaOffice(): Attribute
    {
        return Attribute::make(set: fn(?string $value) => $value ? strtoupper(trim($value)) : null);
    }

    protected function countryCode(): Attribute
    {
        return Attribute::make(set: fn(string $value) => strtoupper(trim($value)));
    }

    protected function sdiCode(): Attribute
    {
        return Attribute::make(set: fn(?string $value) => $value ? strtoupper(trim($value)) : null);
    }

    protected function vatNumber(): Attribute
    {
        // Solo cifre/lettere, senza spazi né prefisso paese (es. "IT 123..." -> "123...")
        return Attribute::make(
            set: fn(string $value) => preg_replace('/[^A-Za-z0-9]/', '', $value)
        );
    }

    /* |-------------------------------------------------------------------------- | IMPLEMENTS |-------------------------------------------------------------------------- */
    public function getDatabaseName(): string
    {
        $connection = config('database.default');

        return (string) config("database.connections.{$connection}.database");
    }

    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    /** * Utenti associati all'azienda. CON RELAZIONE M->M */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'company_user',
            'company_id',
            'user_id',
        )
            ->using(CompanyUser::class)
            ->withPivot('id', 'role')
            ->withTimestamps();
    }

    /* COLLEGAMENTO CON MODEL PIVOT COMPANYUSER */
    public function companyUsers(): HasMany
    {
        return $this->hasMany(CompanyUser::class, 'company_id');
    }

    /** * Impostazioni dell'azienda. */
    public function companySettings(): HasOne
    {
        return $this->hasOne(CompanySettings::class);
    }

    /** * Quote associati all'azienda. */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    //collegamento a Client
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    // collegamento ad audit
    public function audits(): HasMany 
    {
        return $this->hasMany(AuditLog::class);
    }

    // collegamento a client_groups
    public function clientGroups(): HasMany
    {
        return $this->hasMany(ClientGroup::class);
    }


    /*
    |--------------------------------------------------------------------------
    | HELPER
    |--------------------------------------------------------------------------
    */
    public function isOnTrial(): bool
    {
        return $this->status === CompanyStatus::Trial
            && $this->trial_ends_at?->isFuture();
    }
}
