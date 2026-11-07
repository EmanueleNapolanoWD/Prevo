<?php

declare(strict_types=1);

namespace App\Domains\Clients\Dtos;

use Illuminate\Support\Arr;

final readonly class UpdateClientData
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

        public bool $emailsProvided,
        public array $emails,

        public bool $phonesProvided,
        public array $phones,

        public bool $addressesProvided,
        public array $addresses,

        public bool $groupIdsProvided,
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

            emailsProvided: array_key_exists('emails', $data),
            emails: self::normalizeRows($data['emails'] ?? []),

            phonesProvided: array_key_exists('phones', $data),
            phones: self::normalizeRows($data['phones'] ?? []),

            addressesProvided: array_key_exists('addresses', $data),
            addresses: self::normalizeRows($data['addresses'] ?? []),

            groupIdsProvided: array_key_exists('group_ids', $data),
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