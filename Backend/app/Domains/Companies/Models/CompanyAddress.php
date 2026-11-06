<?php

namespace App\Domains\Companies\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyAddress extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id',
        'type',
        'address',
        'city',
        'province',
        'postal_code',
        'country_code',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    protected function province(): Attribute
    {
        return Attribute::make(set: fn (string $value) => strtoupper(trim($value)));
    }

    protected function countryCode(): Attribute
    {
        return Attribute::make(set: fn (string $value) => strtoupper(trim($value)));
    }

    // relazioni
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
