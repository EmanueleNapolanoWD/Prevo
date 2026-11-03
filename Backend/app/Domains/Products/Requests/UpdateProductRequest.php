<?php 

namespace App\Domains\Products\Requests;

class UpdateProductRequest extends ProductRequest
{
    public function ignoredProductId(): ?string
    {
        return (string) $this->route('productId');
    }
}