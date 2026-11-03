<?php

namespace App\Domains\Clients\Models;

use App\Domains\Clients\Models\Client;
use App\Domains\Clients\Models\ClientEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientPhone extends Model
{
    use HasUuids;
    protected $table = 'client_phones';

    protected $fillable = [
        'phone',
        'label',
        'is_primary'
    ];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    protected static function booted(): void
    {
        // company_id è denormalizzato: lo copio dal cliente se non è già impostato
        static::creating(function (ClientPhone $phone) {
            $phone->company_id ??= Client::withTrashed()
                ->whereKey($phone->client_id)
                ->value('company_id');
        });
    }

    protected function phone(): Attribute
    {
        return Attribute::make(set: fn(string $v) => preg_replace('/[^\d+]/', '', $v));
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
