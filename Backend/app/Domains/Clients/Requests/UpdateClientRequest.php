<?php

namespace App\Domains\Clients\Requests;

use Illuminate\Validation\Rule;

class UpdateClientRequest extends ClientRequest
{
    protected function childIdRules(string $table): ?array
    {
        return [
            'nullable',
            'uuid',
            // La riga deve appartenere a questo cliente, non a un altro.
            Rule::exists($table, 'id')->where('client_id', $this->route('clientId')),
        ];
    }
}
