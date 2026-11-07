<?php

namespace App\Domains\Clients\Actions;

use App\Domains\Clients\Dtos\StoreClientData;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use Illuminate\Support\Facades\DB;

class CreateClientAction
{
    public function execute(Company $company, StoreClientData $data): Client
    {
        return DB::transaction(function () use ($company, $data) {

            $client = $company->clients()->create($data->attributes);

            // email
            if ($data->emails !== []) {
                $client->emails()->createMany($data->emails);
            }

            // telefono
            if ($data->phones !== []) {
                $client->phones()->createMany($data->phones);
            }

            // Creazione indirizzi.
            if ($data->addresses !== []) {
                $client->addresses()->createMany($data->addresses);
            }

            // Associazione gruppi.
            if ($data->groupIds !== []) {
                $client->groups()->sync($data->groupIds);
            }

            return $client->load([
                'emails',
                'phones',
                'addresses',
                'groups',
            ]);
        });
    }
}