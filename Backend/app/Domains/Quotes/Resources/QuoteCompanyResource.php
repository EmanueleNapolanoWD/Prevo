<?php

namespace App\Domains\Quotes\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteCompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'legal_name' => $this->legal_name,
            'vat_number' => $this->vat_number,
            'tax_code' => $this->tax_code,
            'tax_regime' => $this->tax_regime,
            'sdi_code' => $this->sdi_code,
            'pec' => $this->pec,
            'iban' => $this->iban,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'province' => $this->province,
            'email' => $this->email,
            'phone' => $this->phone,
            'logo_url' => $this->logoUrl(),
        ];
    }
}