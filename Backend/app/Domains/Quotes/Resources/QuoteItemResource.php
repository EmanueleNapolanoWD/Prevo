<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Domains\Quotes\Models\QuoteItem */
class QuoteItemResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'description' => $this->description,
            'unit' => $this->unit,
            'quantity' => (float) $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'discount_type' => $this->discount_type?->value,
            'discount_value' => $this->discount_value !== null ? (float) $this->discount_value : null,
            'vat_rate' => (float) $this->vat_rate,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'sort_order' => $this->sort_order,
        ];
    }
}