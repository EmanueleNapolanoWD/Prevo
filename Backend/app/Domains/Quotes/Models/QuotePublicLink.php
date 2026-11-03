<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Quotes\Models\Quote;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotePublicLink extends Model
{

    use HasUuids;
    protected $table = 'quote_public_links';

    protected $fillable = [
        'quote_id',
        'hash_token',
        'expires_at',
        'revoked_at',
        'last_accessed_at',
    ];

    public function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_accessed_at' => 'datetime',
        ];
    }

    // relazioni
    //quote
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}

