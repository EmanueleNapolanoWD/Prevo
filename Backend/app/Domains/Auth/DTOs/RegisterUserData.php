<?php

namespace App\Domains\Auth\DTOs;

final readonly class RegisterUserData
{
    public function __construct(
        public string $name,
        public string $surname,
        public string $email,
        public string $password, // in chiaro: si fa l'hash nell'Action, mai loggare questo DTO
    ) {
    }

    /** @param array<string, mixed> $v dati già validati */
    public static function fromValidated(array $v): self
    {
        return new self($v['name'], $v['surname'], $v['email'], $v['password']);
    }
}