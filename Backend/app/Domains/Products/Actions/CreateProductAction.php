<?php

namespace App\Domains\Products\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateProductAction
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
    public function execute(Company $company, User $actor, array $data): Product
    {
        $data = Arr::only($data, self::FIELDS);

        return DB::transaction(function () use ($company, $actor, $data) {
            $this->assertCategoryBelongsToCompany($company, $data['category_id'] ?? null);

            $product = $company->products()->create($data)->refresh();

            $this->audit->log(
                event: 'product.created',
                user: $actor,
                company: $company,
                auditable: $product,
                new: $product->only(self::FIELDS),
            );

            return $product->load('category:id,name');
        });
    }

    /** Seconda barriera dopo la FormRequest: l'action non si fida di chi la chiama. */
    private function assertCategoryBelongsToCompany(Company $company, ?string $categoryId): void
    {
        if ($categoryId === null) {
            return;
        }

        // Il soft delete esclude da solo le categorie eliminate
        if (!$company->productCategories()->whereKey($categoryId)->exists()) {
            throw ValidationException::withMessages([
                'category_id' => 'La categoria selezionata non esiste.',
            ]);
        }
    }
}