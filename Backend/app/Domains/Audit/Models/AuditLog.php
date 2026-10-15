<?php

namespace App\Domains\Audit\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use LogicException;

class AuditLog extends Model
{
    use HasUuids;

    protected $table = 'audit_logs';

    const UPDATED_AT = null;

    protected $fillable = [
        'company_id',
        'user_id',
        'event',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array 
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime'
        ];
    }

     protected static function booted(): void
    {
        // Audit log immutabile
        static::updating(fn () => throw new LogicException('Gli audit log non sono modificabili.'));
        static::deleting(fn () => throw new LogicException('Gli audit log non sono eliminabili.'));
    }

    // RELAZIONI
    // company
    public function companies(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    //user 
    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo 
    {
        return $this->morphTo();
    }
}
