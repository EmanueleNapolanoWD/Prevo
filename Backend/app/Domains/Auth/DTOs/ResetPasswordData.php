<?php

namespace App\Domains\Auth\DTOs;

final readonly class ResetPasswordData
{
    public function __construct(
        public string $token,
        public string $email,
        public string $password,
        public string $password_confirmation,
    ) {}

    public static function fromValidated(array $v): self
    {
        return new self(
            token: $v['token'],
            email: $v['email'],
            password: $v['password'],
            password_confirmation: $v['password_confirmation'],
        );
    }
}