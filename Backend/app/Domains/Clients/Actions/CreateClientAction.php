<?php

namespace App\Domains\Clients\Actions;

use App\Domains\Companies\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateClientAction
{

    private const RELATIONS = ['emails', 'phones', 'addresses', 'websites', 'recipients'];

    public function execute(Company $company, array $data): JsonResponse
    {
        return DB::transaction(function () use ($company, $data) {
            $children = Arr::only($data, self::RELATIONS);
            $attributes = Arr::except($data, self::RELATIONS);

            // tenant preso da relazione no da payload
            unset($attributes['company_id']);

            $client = $company->clients()->create($attributes);

            foreach ($children as $relation => $rows) {
                $rows = array_values(array_filter($rows, fn(array $row) => filled(array_filter($row))));

                if ($rows !== []) {
                    $client->{$relation}()->createMany($rows);
                }
            }

            return $client->load(self::RELATIONS);
        });
    }
}