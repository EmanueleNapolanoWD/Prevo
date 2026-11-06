<?php

namespace App\Domains\Auth\DTOs;

final readonly class LoginUserData
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember = false,
    ) {}

    /** @param array<string, mixed> $v dati già validati */
    public static function fromValidated(array $v): self
    {
        return new self(
            email: $v['email'],
            password: $v['password'],
            remember: $v['remember'] ?? false,
        );
    }
}