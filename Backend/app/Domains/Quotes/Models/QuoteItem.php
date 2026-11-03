<?php

namespace App\Domains\Quotes\Models;

use App\Domains\Products\Models\Product;
use App\Domains\Quotes\Enums\DiscountType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    use HasUuids;
    protected $table = 'quote_items';

    protected $fillable = [
        'quote_id',
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
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
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

    // prodotti
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
