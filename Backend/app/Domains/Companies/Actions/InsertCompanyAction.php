<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\DTOs\CompanyData;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use Illuminate\Support\Str;

class InsertCompanyAction
{
    public function execute(
        User $user,
        CompanyData $data
    ): Company {

        $companyName = trim($data->name);
        // crea l'azienda (le company_settings le crea l'evento created del model)
        $company = Company::create([
            'name' => $companyName,
            'legal_name' => $data->legal_name ?? $companyName,
            'legal_form' => $data->legal_form ?? null,
            'slug' => $this->generateUniqueSlug($companyName),

            'country_code' => $data->country_code ?? 'IT',
            'vat_number' => $data->vat_number ?? null,
            'tax_code' => $data->tax_code ?? null,
            'tax_regime' => $data->tax_regime ?? null,
            'sdi_code' => $data->sdi_code ?? null,
            'pec' => $data->pec ?? null,
            'website' => $data->website ?? null,

            'trial_ends_at' => now()->addDays(14),
        ]);

        // inserimento email
        foreach ($data->emails as $emailData) {
            $company->emails()->create([
                'label' => $emailData->label ?? null,
                'email' => $emailData->email,
                'is_primary' => $emailData->is_primary ?? false,
            ]);
        }

        // inserimento phones
        foreach ($data->phones as $phoneData) {
            $company->phones()->create([
                'label' => $phoneData->label ?? null,
                'phone' => $phoneData->phone,
                'is_primary' => $phoneData->is_primary ?? false,
            ]);
        }

        // inserimento addresses
        foreach ($data->addresses as $addressData) {
            $company->addresses()->create([
                'label' => $addressData->label ?? null,
                'address' => $addressData->address,
                'city' => $addressData->city ?? null,
                'postal_code' => $addressData->postal_code ?? null,
                'province' => $addressData->province ?? null,
                'country_code' => $addressData->country_code ?? 'IT',
                'is_primary' => $addressData->is_primary ?? false,
            ]);
        }

        // associa l'utente all'azienda
        $user->companies()->attach($company->id, [
            'role' => CompanyRole::OWNER->value,
        ]);

        return $company;

    }

    // funzione che serve a generare slug univoco per le company
    private function generateUniqueSlug(string $name): string
    {
        $base = Str::slug(mb_substr($name, 0, 80)) ?: 'company';
        $slug = $base;
        $i = 2;

        while (Company::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}