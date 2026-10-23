<?php

declare(strict_types=1);

namespace App\Domains\Quotes\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Domains\Quotes\Models\Quote */
class QuoteResource extends JsonResource
{
    /** @return array<string, mixed> Importi come numeri (euro, 2 decimali). */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'version' => $this->version,
            'status' => $this->status->value,
            'title' => $this->title,
            'description' => $this->description,
            'notes' => $this->notes,
            'terms' => $this->terms,
            'valid_until' => $this->valid_until?->toIso8601String(),

            'client_id' => $this->client_id,
            'client' => $this->client_snapshot,

            'appearance' => [
                'template' => $this->template,
                'primary_color' => $this->primary_color,
                'accent_color' => $this->accent_color,
            ],
            'contact' => [
                'email' => $this->contact_email,
                'phone' => $this->contact_phone,
                'address' => $this->contact_address,
            ],

            'currency' => $this->currency,
            'subtotal' => (float) $this->subtotal,
            'discount_total' => (float) $this->discount_total,
            'surcharge' => (float) $this->surcharge,
            'taxable_amount' => (float) $this->taxable_amount,
            'tax_total' => (float) $this->tax_total,
            'total' => (float) $this->total,

            'items' => QuoteItemResource::collection($this->whenLoaded('items')),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}