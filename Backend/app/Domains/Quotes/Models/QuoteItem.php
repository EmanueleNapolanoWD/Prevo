<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Quotes\Enums\DiscountType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    use HasUuids;
    protected $table = 'quote_items';

    protected $fillable = [
        'product_id',
        'description',
        'unit',
        'quantity',
        'unit_price',
        'discount_type',
        'discount_value',
        'vat_rate',
        'subtotal',
        'tax_amount',
        'total',
        'sort_order'
    ];

    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:4',
            'discount_type' => DiscountType::class,
            'discount_value' => 'decimal:4',
            'vat_rate' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    // Relazioni
    // Quote
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
