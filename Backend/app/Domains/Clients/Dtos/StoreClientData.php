<?php

declare(strict_types=1);

namespace App\Domains\Clients\Dtos;

use Illuminate\Support\Arr;

final readonly class StoreClientData
{
    /**
     * @param array<string, mixed> $attributes
     * @param array<int, array<string, mixed>> $emails
     * @param array<int, array<string, mixed>> $phones
     * @param array<int, array<string, mixed>> $addresses
     * @param array<int, string> $groupIds
     */
    private function __construct(
        public array $attributes,
        public array $emails,
        public array $phones,
        public array $addresses,
        public array $groupIds,
    ) {}

    public static function from(array $data): self
    {
        return new self(
            attributes: Arr::except($data, [
                'company_id',
                'emails',
                'phones',
                'addresses',
                'group_ids',
            ]),
            emails: self::normalizeRows($data['emails'] ?? []),
            phones: self::normalizeRows($data['phones'] ?? []),
            addresses: self::normalizeRows($data['addresses'] ?? []),
            groupIds: array_values($data['group_ids'] ?? []),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function normalizeRows(mixed $rows): array
    {
        if (! is_array($rows)) {
            return [];
        }

        return array_values(array_filter($rows, 'is_array'));
    }
}