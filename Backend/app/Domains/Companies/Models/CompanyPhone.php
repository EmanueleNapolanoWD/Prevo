<?php

namespace App\Domains\Companies\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyPhone extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id',
        'phone',
        'type',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    // relazioni
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
