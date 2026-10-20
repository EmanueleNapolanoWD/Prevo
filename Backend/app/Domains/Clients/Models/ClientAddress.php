<?php

namespace App\Domains\Clients\Models;

use App\Domains\Clients\Enums\AddressType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientAddress extends Model
{
    use HasUuids;

    protected $table = 'client_addresses';

    protected $fillable = [
        'type',
        'street',
        'street_number',
        'extra',
        'postal_code',
        'city',
        'province',
        'country_code',
        'is_default',
    ];

    protected $attributes = [
        'type' => 'BILLING',
        'country_code' => 'IT',
        'is_default' => false,
    ];

    protected function casts(): array
    {
        return [
            'type' => AddressType::class,
            'is_default' => 'boolean'
        ];
    }

    protected function province(): Attribute
    {
        return Attribute::make(set: fn(string $v) => $v ? strtoupper(trim($v)) : null);
    }

    protected function countryCode(): Attribute
    {
        return Attribute::make(set: fn (string $v) => strtoupper($v));
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
