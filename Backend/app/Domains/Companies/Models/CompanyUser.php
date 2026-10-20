<?php

namespace App\Domains\Companies\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CompanyUser extends Pivot
{
    use HasUuids;

    protected $table = 'company_user';

    protected $fillable = [
        'user_id',
        'company_id',
        'role'
    ];

    protected function casts(): array 
    {
        return [
            'role' => CompanyRole::class
        ];
    }

    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
