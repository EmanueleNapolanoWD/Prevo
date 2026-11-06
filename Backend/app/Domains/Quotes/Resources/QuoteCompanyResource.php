<?php

namespace App\Domains\Quotes\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteCompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryEmail = $this->emails
            ->firstWhere('is_primary', true);

        $primaryPhone = $this->phones
            ->firstWhere('is_primary', true);

        $primaryAddress = $this->addresses
            ->firstWhere('is_primary', true)
            ?? $this->addresses->firstWhere('type', 'legal');

        return [
            'name' => $this->name,
            'legal_name' => $this->legal_name,

            'vat_number' => $this->vat_number,
            'tax_code' => $this->tax_code,
            'tax_regime' => $this->tax_regime,

            'sdi_code' => $this->sdi_code,
            'pec' => $this->pec,
            'iban' => $this->iban,

            // Contatti principali
            'email' => $primaryEmail?->email,
            'phone' => $primaryPhone?->phone,

            // Indirizzo principale con fallback legale
            'address' => $primaryAddress ? [
                'type' => $primaryAddress->type,
                'address' => $primaryAddress->address,
                'address_extra' => $primaryAddress->address_extra,
                'postal_code' => $primaryAddress->postal_code,
                'city' => $primaryAddress->city,
                'province' => $primaryAddress->province,
                'country_code' => $primaryAddress->country_code,
            ] : null,

            // Tutti i contatti aziendali
            'emails' => $this->whenLoaded(
                'emails',
                fn () => $this->emails->map(fn ($email) => [
                    'email' => $email->email,
                    'type' => $email->type,
                    'is_primary' => $email->is_primary,
                ])->values()
            ),

            'phones' => $this->whenLoaded(
                'phones',
                fn () => $this->phones->map(fn ($phone) => [
                    'phone' => $phone->phone,
                    'type' => $phone->type,
                    'is_primary' => $phone->is_primary,
                ])->values()
            ),

            'addresses' => $this->whenLoaded(
                'addresses',
                fn () => $this->addresses->map(fn ($address) => [
                    'label' => $address->label,
                    'type' => $address->type,
                    'address' => $address->address,
                    'address_extra' => $address->address_extra,
                    'postal_code' => $address->postal_code,
                    'city' => $address->city,
                    'province' => $address->province,
                    'country_code' => $address->country_code,
                    'is_primary' => $address->is_primary,
                ])->values()
            ),

            'logo_url' => $this->logoUrl(),
        ];
    }
}