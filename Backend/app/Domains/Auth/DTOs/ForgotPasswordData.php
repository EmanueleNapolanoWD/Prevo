<?php

namespace App\Domains\Auth\DTOs;

final readonly class ForgotPasswordData
{
    public function __construct(
        public string $email,
    ) {}

    /** @param array<string, mixed> $v dati già validati */
    public static function fromValidated(array $v): self
    {
        return new self(
            email: $v['email'],
        );
    }
}