<?php

declare(strict_types=1);

namespace App\Domains\Clients\Dtos\shared;

final readonly class ClientAddressData
{
    public function __construct(
        public string $street,
        public string $postalCode,
        public string $city,
        public ?string $type = null,
        public ?string $streetNumber = null,
        public ?string $extra = null,
        public ?string $countryCode = null,
        public ?string $province = null,
        public ?bool $isDefault = null,
        public ?string $id = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            street: $data['street'],
            postalCode: $data['postal_code'],
            city: $data['city'],
            type: $data['type'] ?? null,
            streetNumber: $data['street_number'] ?? null,
            extra: $data['extra'] ?? null,
            countryCode: $data['country_code'] ?? null,
            province: $data['province'] ?? null,
            isDefault: isset($data['is_default'])
            ? (bool) $data['is_default']
            : null,
            id: $data['id'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'id' => $this->id,
            'type' => $this->type,
            'street' => $this->street,
            'street_number' => $this->streetNumber,
            'extra' => $this->extra,
            'postal_code' => $this->postalCode,
            'city' => $this->city,
            'country_code' => $this->countryCode,
            'province' => $this->province,
            'is_default' => $this->isDefault,
        ], fn($value) => $value !== null);
    }
}