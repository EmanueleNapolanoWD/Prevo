<?php

namespace App\Domains\Products\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category
                ? ['id' => $this->category->id, 'name' => $this->category->name]
                : null),
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'unit' => $this->unit?->value,
            'sale_price' => $this->sale_price,
            'cost_price' => $this->cost_price,
            'vat_rate' => $this->vat_rate,
            'margin' => $this->margin,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}