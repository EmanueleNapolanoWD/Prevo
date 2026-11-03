<?php

namespace App\Domains\Clients\Actions;

use App\Domains\Clients\Models\Client;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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


    public function execute(Client $client, array $data)
    {

        Log::debug('Aggiornamento cliente richiesto', [
            'client_id' => $client->id,
            'company_id' => $client->company_id,
            'fields' => array_keys($data),
            'relations' => array_values(array_filter(
                ['emails', 'phones', 'addresses', 'group_ids'],
                fn(string $relation) => array_key_exists($relation, $data)
            )),
        ]);


        return DB::transaction(function () use ($client, $data) {
            $fields = Arr::only($data, self::CLIENT_FIELDS);

            //coerenza tra tipo e dato anagrafico
            if (($fields['type'] ?? $client->type) === 'PERSON') {
                $fields['company_name'] = null;
            } else {
                $fields['salutation'] = null;
                $fields['name'] = null;
                $fields['surname'] = null;
            }


            $client->update($fields);

            // relazioni solo se presenti in payload

            // se presente email
            if (array_key_exists('emails', $data)) {
                $this->syncChildren($client, 'emails', $data['emails'], ['company_id' => $client->company_id]);
            }

            // se presente phone
            if (array_key_exists('phones', $data)) {
                $this->syncChildren($client, 'phones', $data['phones'], ['company_id' => $client->company_id]);
            }

            // se presente addresses
            if (array_key_exists('addresses', $data)) {
                $this->syncChildren($client, 'addresses', $data['addresses'], ['company_id' => $client->company_id]);
            }

            if (array_key_exists('group_ids', $data)) {
                $client->groups()->sync($data['group_ids']);
            }

            return $client->refresh()->load(['emails', 'phones', 'addresses']);

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