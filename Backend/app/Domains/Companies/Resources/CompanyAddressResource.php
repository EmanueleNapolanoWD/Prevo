<?php

namespace App\Domains\Companies\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyAddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'label' => $this->label,
            'type' => $this->type,
            'address' => $this->address,
            'address_extra' => $this->address_extra,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'province' => $this->province,
            'country_code' => $this->country_code,
            'is_primary' => (bool) $this->is_primary,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}