<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use Illuminate\Support\Str;

class InsertCompanyAction
{
    public function execute(
        User $user,
        array $data
    ): Company
    {

        // crea l'azienda (le company_settings le crea l'evento created del model)
        $company = Company::create([
            'name'        => $data['company_name'],
            'legal_name'  => $data['legal_name'],
            'legal_form'  => $data['legal_form'] ?? null,
            'slug'        => $this->generateUniqueSlug($data['company_name']),

            'country_code' => $data['country_code'] ?? 'IT',
            'vat_number'   => $data['vat_number'],
            'tax_code'     => $data['tax_code'] ?? null,
            'tax_regime'   => $data['tax_regime'] ?? null,
            'sdi_code'     => $data['sdi_code'] ?? null,
            'pec'          => $data['pec'] ?? null,

            'address'     => $data['address'],
            'postal_code' => $data['postal_code'],
            'city'        => $data['city'],
            'province'    => $data['province'],

            'email'   => $data['company_email'],
            'phone'   => $data['phone'],
            'website' => $data['website'] ?? null,

            'trial_ends_at' => now()->addDays(14),
        ]);

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