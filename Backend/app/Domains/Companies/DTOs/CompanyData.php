<?php

namespace App\Domains\Companies\DTOs;

use Illuminate\Support\Arr;

final readonly class CompanyData
{
    /**
     * @param CompanyEmailData[]   $emails
     * @param CompanyPhoneData[]   $phones
     * @param CompanyAddressData[] $addresses
     */
    public function __construct(
        public string $name,
        public string $legal_name,
        public string $country_code,
        public ?string $legal_form,
        public ?string $vat_number,
        public ?string $tax_code,
        public ?string $tax_regime,
        public ?string $sdi_code,
        public ?string $pec,
        public ?string $website,
        public array $emails,
        public array $phones,
        public array $addresses,
    ) {
    }

    /** @param array<string, mixed> $v dati già validati */
    public static function fromValidated(array $v): self
    {
        return new self(
            name: $v['name'],
            legal_name: $v['legal_name'] ?? $v['name'],
            country_code: $v['country_code'] ?? 'IT',
            legal_form: $v['legal_form'] ?? null,
            vat_number: $v['vat_number'] ?? null,
            tax_code: $v['tax_code'] ?? null,
            tax_regime: $v['tax_regime'] ?? null,
            sdi_code: $v['sdi_code'] ?? null,
            pec: $v['pec'] ?? null,
            website: $v['website'] ?? null,
            emails: array_map(fn(array $r) => new CompanyEmailData(
                email: $r['email'],
                is_primary: (bool) $r['is_primary'],
                label: $r['label'] ?? null,
            ), $v['emails']),
            phones: array_map(fn(array $r) => new CompanyPhoneData(
                phone: $r['phone'],
                is_primary: (bool) $r['is_primary'],
                label: $r['label'] ?? null,
            ), $v['phones']),
            addresses: array_map(fn(array $r) => new CompanyAddressData(
                address: $r['address'],
                city: $r['city'],
                postal_code: $r['postal_code'],
                province: $r['province'],
                country_code: $r['country_code'] ?? 'IT',
                is_primary: (bool) $r['is_primary'],
                label: $r['label'] ?? null,
            ), $v['addresses']),
        );
    }

    /**
     * Colonne scalari della tabella companies.
     * Esplicito di proposito: liste e logo non devono mai finire qui.
     */
    public function toAttributes(): array
    {
        return [
            'name' => $this->name,
            'legal_name' => $this->legal_name,
            'country_code' => $this->country_code,
            'legal_form' => $this->legal_form,
            'vat_number' => $this->vat_number,
            'tax_code' => $this->tax_code,
            'tax_regime' => $this->tax_regime,
            'sdi_code' => $this->sdi_code,
            'pec' => $this->pec,
            'website' => $this->website,
        ];
    }

}

final readonly class CompanyEmailData implements CompanyListRow
{
    public function __construct(
        public string $email,
        public bool $is_primary = false,
        public ?string $label = null,
        public ?string $id = null,
    ) {
    }

    /** @param array<string, mixed> $r */
    public static function fromArray(array $r): self
    {
        return new self(
            email: $r['email'],
            is_primary: (bool) $r['is_primary'],
            label: $r['label'] ?? null,
            id: $r['id'] ?? null,
        );
    }

    /** Colonne scrivibili (company_id lo imposta la relazione). */
    public function rowId(): ?string
    {
        return $this->id;
    }

    public function toAttributes(): array
    {
        return Arr::except(get_object_vars($this), ['id']);
    }

}

final readonly class CompanyPhoneData implements CompanyListRow
{
    public function __construct(
        public string $phone,
        public bool $is_primary = false,
        public ?string $label = null,
        public ?string $id = null,
    ) {
    }

    public static function fromArray(array $r): self
    {
        return new self(
            phone: $r['phone'],
            is_primary: (bool) $r['is_primary'],
            label: $r['label'] ?? null,
            id: $r['id'] ?? null,
        );
    }

    public function rowId(): ?string
    {
        return $this->id;
    }

    public function toAttributes(): array
    {
        return Arr::except(get_object_vars($this), ['id']);
    }

}

final readonly class CompanyAddressData implements CompanyListRow
{
    public function __construct(
        public string $address,
        public string $city,
        public string $postal_code,
        public string $province,
        public string $country_code = 'IT',
        public bool $is_primary = false,
        public ?string $label = null,
        public string $type = 'legal',
        public ?string $address_extra = null,
        public ?string $id = null,
    ) {
    }

    public static function fromArray(array $r): self
    {
        return new self(
            address: $r['address'],
            city: $r['city'],
            postal_code: $r['postal_code'],
            province: $r['province'],
            country_code: $r['country_code'] ?? 'IT',
            is_primary: (bool) $r['is_primary'],
            label: $r['label'] ?? null,
            type: $r['type'] ?? 'legal',
            address_extra: $r['address_extra'] ?? null,
            id: $r['id'] ?? null,
        );
    }

    public function rowId(): ?string
    {
        return $this->id;
    }

    public function toAttributes(): array
    {
        return Arr::except(get_object_vars($this), ['id']);
    }

}
