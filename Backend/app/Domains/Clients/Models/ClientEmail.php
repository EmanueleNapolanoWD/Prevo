<?php

namespace App\Domains\Clients\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientEmail extends Model
{
    use HasUuids;
    protected $table = 'client_emails';

    protected $fillable = [
        'email',
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
        static::creating(function (ClientEmail $email) {
            $email->company_id ??= Client::withTrashed()
                ->whereKey($email->client_id)
                ->value('company_id');
        });
    }

    protected function email(): Attribute
    {
        return Attribute::make(set: fn(string $v) => mb_strtolower(trim($v)));
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }


}
