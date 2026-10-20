<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'company_id',
        'client_id',
        'created_by',
        'number',
        'version',
        'status',
        'title',
        'description',
        'subtotal',
        'discount_total',
        'taxable_amount',
        'tax_total',
        'total',
        'currency',
        'valid_until',
        'send_at',
        'viewed_at',
        'accepted_at',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',

            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'taxable_amount' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',

            'valid_until' => 'datetime',
            'send_at' => 'datetime',
            'viewed_at' => 'datetime',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    // Collegamento con il modello Company
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    // Collegamento con il modello Client
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    // Collegamento con il modello User (creatore del preventivo)
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
