<?php

namespace App\Domains\Products\Actions;

use App\Domains\Audit\Models\AuditLog;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Products\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateProductAction
{

    private const FIELDS = [
        'category_id',
        'code',
        'name',
        'description',
        'unit',
        'sale_price',
        'cost_price',
        'vat_rate',
        'is_active',
    ];

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(Product $product, User $user, array $data): Product
    {
        $data = Arr::only($data, self::FIELDS);

        return DB::transaction(function () use ($product, $user, $data) {
            $product = Product::query()->lockForUpdate()->findOrFail($product->getKey());

            $this->assertCategoryBelongsToCompany($product, $data['category_id'] ?? null);

            $product->fill($data);

            if ($product->isDirty()) {
                $changed = array_keys($product->getDirty());
                $old = Arr::only($product->getOriginal(), $changed);

                $product->save();

                $this->audit->log(
                    event: 'product.updated',
                    user: $user,
                    company: $product->company,
                    auditable: $product,
                    old: $old,
                    new: Arr::only($product->getAttributes(), $changed),
                );
            }

            return $product->refresh()->load('category:id,name');
        });
    }

    /** Seconda barriera dopo la FormRequest: l'action non si fida di chi la chiama. */
    private function assertCategoryBelongsToCompany(Product $product, ?string $categoryId): void
    {
        if ($categoryId === null) {
            return;
        }

        if (!$product->company->productCategories()->whereKey($categoryId)->exists()) {
            throw ValidationException::withMessages([
                'category_id' => 'La categoria selezionata non esiste.',
            ]);
        }
    }
}