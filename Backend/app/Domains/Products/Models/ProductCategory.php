<?php

namespace App\Domains\Products\Models;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{

    use HasUuids, SoftDeletes;
    protected $table = 'products_categories';

    protected $fillable = [
        'name',
        'description',
    ];

    // ============= RELAZIONI

    //relazione con company
    public function comapnies(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    //relazine cone product
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
