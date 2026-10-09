<?php

namespace App\Domains\Companies\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Multitenancy\Contracts\IsTenant;
use Spatie\Multitenancy\Models\Concerns\ImplementsTenant;

class Company extends Model implements IsTenant
{
    use HasUuids, ImplementsTenant;

    protected $table = 'companies';

    protected $fillable = [
        'name',
        'legal_name',
        'vat_number',
        'tax_code',
        'address',
        'postal_code',
        'city',
        'province',
        'email',
        'phone',
        'website',
        'logo_path',
    ];

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
}
