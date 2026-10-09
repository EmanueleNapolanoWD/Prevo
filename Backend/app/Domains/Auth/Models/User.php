<?php

namespace App\Domains\Auth\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Models\CompanyUser;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'surname', 'email', 'password', 'last_login_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUuids, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    /** * Aziende a cui l'utente è associato. Relazione M->M */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(
            Company::class,
            'company_user',
            'user_id',
            'company_id'
        )
            ->using(CompanyUser::class)
            ->withPivot('id', 'role')
            ->withTimestamps();
    }

    /* COLLEGAMENTO CON MODEL PIVOT COMPANYUSER */
    public function companyUsers(): HasMany
    {
        return $this->hasMany(CompanyUser::class, 'user_id');
    }
}
