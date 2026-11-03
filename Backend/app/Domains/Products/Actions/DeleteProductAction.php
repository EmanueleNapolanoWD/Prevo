<?php

namespace App\Domains\Products\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Products\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class DeleteProductAction
{
    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(Product $product, User $actor): void
    {
        DB::transaction(function () use ($product, $actor) {
            $snapshot = Arr::only($product->getAttributes(), [
                'category_id',
                'code',
                'name',
                'unit',
                'sale_price',
                'vat_rate',
                'is_active',
            ]);

            $product->delete(); // soft delete

            $this->audit->log(
                event: 'product.deleted',
                user: $actor,
                company: $product->company,
                auditable: $product,
                old: $snapshot,
            );
        });
    }
}