<?php

namespace App\Domains\Clients\Actions;

use App\Domains\Clients\Dtos\UpdateClientData;
use App\Domains\Clients\Models\Client;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateClientAction
{
    private const CLIENT_FIELDS = [
        'type',
        'salutation',
        'name',
        'surname',
        'company_name',
        'website',
        'pec',
        'note',
        'payment_terms',
        'country_code',
        'tax_code',
        'vat_number',
        'sdi_code',
        'default_vat_rate',
        'is_public_administration',
    ];


    public function execute(Client $client, UpdateClientData $data)
    {
        return DB::transaction(function () use ($client, $data): Client {
            $fields = Arr::only($data->attributes, self::CLIENT_FIELDS);

            //coerenza tra tipo e dato anagrafico
            if (($fields['type'] ?? $client->type) === 'PERSON') {
                $fields['company_name'] = null;
            } else {
                $fields['salutation'] = null;
                $fields['name'] = null;
                $fields['surname'] = null;
            }

            if ($fields !== []) {
                $client->update($fields);
            }


            $client->update($fields);

            // relazioni solo se presenti in payload

            // Sincronizzazione email.
            if ($data->emailsProvided) {
                $this->syncChildren(
                    $client,
                    'emails',
                    $data->emails,
                );
            }

            // Sincronizzazione telefoni.
            if ($data->phonesProvided) {
                $this->syncChildren(
                    $client,
                    'phones',
                    $data->phones,
                );
            }

            // Sincronizzazione indirizzi.
            if ($data->addressesProvided) {
                $this->syncChildren(
                    $client,
                    'addresses',
                    $data->addresses,
                );
            }

            // Sincronizzazione gruppi.
            if ($data->groupIdsProvided) {
                $client->groups()->sync($data->groupIds);
            }

            return $client->refresh()->load([
                'emails',
                'phones',
                'addresses',
                'groups',
            ]);
        });
    }

    // ====== HELPER =======//
    // AGGIORNA RIGA CON ID 
    private function syncChildren(Client $client, string $relation, array $rows, array $extra = []): void
    {
        $existing = $client->{$relation}()->get()->keyBy('id');
        $keep = [];

        foreach ($rows as $row) {
            $id = $row['id'] ?? null;
            $attributes = Arr::except($row, ['id']) + $extra;

            if ($id && $existing->has($id)) {
                $existing[$id]->update($attributes);
                $keep[] = $id;
            } else {
                $keep[] = $client->{$relation}()->create($attributes)->getKey();
            }
        }

        $client->{$relation}()->whereNotIn('id', $keep)->delete();
    }

}