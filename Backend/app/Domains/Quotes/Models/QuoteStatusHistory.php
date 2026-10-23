<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Auth\Models\User;
use App\Domains\Quotes\Enums\QuoteStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteStatusHistory extends Model
{
    use HasUuids;
    protected $table = 'quote_status_history';

    protected $fillable = [
        'quote_id',
        'from_status',
        'to_status',
        'changed_by',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'quote_id' => 'integer',
            'from_status' => QuoteStatus::class,
            'to_status' => QuoteStatus::class,
            'changed_by' => 'integer',
        ];
    }

    // relazioni
    // quote
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    // changed_by (user)
    public function changenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
