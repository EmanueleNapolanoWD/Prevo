<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Actions\CreateProductAction;
use App\Domains\Products\Actions\DeleteProductAction;
use App\Domains\Products\Actions\UpdateProductAction;
use App\Domains\Products\Models\Product;
use App\Domains\Products\Requests\StoreProductRequest;
use App\Domains\Products\Requests\UpdateProductRequest;
use App\Domains\Products\Resources\ProductResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{

    //recupero tutti iproduct
    public function index(Request $request, Company $company): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [Product::class, $company->id]);

        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'uuid'],
            'active' => ['nullable', 'boolean'],
        ]);

        $products = $company->products()
            ->with('category:id,name')
            ->search($filters['q'] ?? null)
            ->when($filters['category_id'] ?? null, fn($q, $id) => $q->where('category_id', $id))
            ->when(isset($filters['active']), fn($q) => $q->where('is_active', (bool) $filters['active']))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    // recupero singolo product
    public function show(Company $company, string $productId): ProductResource
    {
        $product = $company->products()->with('category:id,name')->findOrFail($productId);

        $this->authorize('view', $product);

        return new ProductResource($product);
    }

    // creazione product
    public function store(
        StoreProductRequest $request,
        CreateProductAction $action,
        Company $company
    ): JsonResponse {
        $this->authorize('create', [Product::class, $company->id]);

        $product = $action->execute($company, $request->user(), $request->validated());

        return (new ProductResource($product->load('category:id,name')))
            ->additional(['message' => 'Prodotto aggiunto correttamente'])
            ->response()
            ->setStatusCode(201);
    }

    // update di product
    public function update(
        UpdateProductRequest $request,
        UpdateProductAction $action,
        Company $company,
        string $productId
    ): ProductResource {

        $product = $company->products()->findOrFail($productId);

        $this->authorize('update', $product);

        $action->execute($product, $request->user(), $request->validated());

        return (new ProductResource($product->load('category:id,name')))
            ->additional(['message' => 'Prodotto aggiornato correttamente']);
    }

    public function destroy(
        Company $company,
        Request $request,
        DeleteProductAction $action,
        string $productId
    ): JsonResponse {
        $product = $company->products()->findOrFail($productId);

        $this->authorize('delete', $product);

        $action->execute($product, $request->user());

        return response()->json(null, 204);
    }
}
