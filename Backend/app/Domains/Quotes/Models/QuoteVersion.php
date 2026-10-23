<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteVersion extends Model
{

use HasUuids;
    protected $table = 'quote_version';

    protected $fillable = [
        'quote_id',
        'version_number',
        'created_by',
        'snapshot',
    ];

    public function casts(): array
    {
        return [
            'quote_id' => 'integer',
            'version_number' => 'integer',
            'created_by' => 'integer',
            'snapshot' => 'json',
        ];
    }

    // relazioni
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
