<?php

namespace App\Domains\Products\Models;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Enums\ProductUnit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'code',
        'name',
        'description',
        'unit',
        'sale_price',
        'cost_price',
        'vat_rate',
        'is_active'
    ];

    protected function casts(): array
    {
        return [
            'unit' => ProductUnit::class,
            'sale_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'is_active' => 'boolean'
        ];
    }


    // ================= RELAZIONI

    //relazione con companies
    public function companies(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    // ============ SCOPES
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%' . $term . '%';

        return $query->where(fn(Builder $q) => $q
            ->where('name', 'like', $like)
            ->orWhere('code', 'like', $like));
    }

    // ================= UTILITY

    /** Margine in percentuale sul prezzo di vendita, null se manca il costo. */
    public function getMarginAttribute(): ?float
    {
        if ($this->cost_price === null || (float) $this->sale_price === 0.0) {
            return null;
        }

        return round(($this->sale_price - $this->cost_price) / $this->sale_price * 100, 2);
    }
}
