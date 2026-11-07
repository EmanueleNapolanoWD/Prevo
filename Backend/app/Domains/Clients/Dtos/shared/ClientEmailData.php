<?php

declare(strict_types=1);

namespace App\Domains\Clients\Dtos\shared;

final readonly class ClientEmailData
{
    public function __construct(
        public string $email,
        public ?string $label = null,
        public ?bool $isPrimary = null,
        public ?string $id = null,
    ) {}

    public static function from(array $data): self
    {
        return new self(
            email: $data['email'],
            label: $data['label'] ?? null,
            isPrimary: isset($data['is_primary'])
                ? (bool) $data['is_primary']
                : null,
            id: $data['id'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'id' => $this->id,
            'email' => $this->email,
            'label' => $this->label,
            'is_primary' => $this->isPrimary,
        ], fn ($value) => $value !== null);
    }
}