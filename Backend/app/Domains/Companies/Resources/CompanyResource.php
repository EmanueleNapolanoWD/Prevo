<?php

namespace App\Domains\Companies\Resources;

use App\Domains\Companies\Resources\CompanyAddressResource;
use App\Domains\Companies\Resources\CompanyEmailResource;
use App\Domains\Companies\Resources\CompanyPhoneResource;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['emails', 'phones', 'addresses']);

        return [
            'id' => $this->id,
            'slug' => $this->slug,

            // identità
            'name' => $this->name,
            'legal_name' => $this->legal_name,
            'legal_form' => $this->legal_form,

            // fiscale
            'country_code' => $this->country_code,
            'vat_number' => $this->vat_number,
            'tax_code' => $this->tax_code,
            'tax_regime' => $this->tax_regime,
            'sdi_code' => $this->sdi_code,
            'pec' => $this->pec,
            'rea_office' => $this->rea_office,
            'rea_number' => $this->rea_number,
            'share_capital' => $this->share_capital,
            'ateco_code' => $this->ateco_code,
            'iban' => $this->iban,

            // online e branding
            'website' => $this->website,
            'logo_url' => $this->logo_path ? $this->logoUrl($this->logo_path) : null,

            // tenant
            'status' => $this->status,
            'trial_ends_at' => $this->trial_ends_at,

            // liste complete, predefinito per primo
            'emails' => CompanyEmailResource::collection($this->sortPrimaryFirst($this->emails)),
            'phones' => CompanyPhoneResource::collection($this->sortPrimaryFirst($this->phones)),
            'addresses' => CompanyAddressResource::collection($this->sortPrimaryFirst($this->addresses)),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /** Predefinito in cima, poi per data di creazione. */
    private function sortPrimaryFirst($collection)
    {
        return $collection
            ->sortBy([
                ['is_primary', 'desc'],
                ['created_at', 'asc'],
            ])
            ->values(); // reindicizza: senza, JSON diventa oggetto e non array
    }

    private function logoUrl(string $path): string
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('r2-logos');

        return $disk->temporaryUrl($path, now()->addMinutes(30));
    }
}