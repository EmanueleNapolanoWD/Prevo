<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateCompanyAction
{
    public function __construct(
        private readonly AuditLogger $audit,
    ) {}

    /** @param array<string, mixed> $data Dati già validati dalla FormRequest. */
    public function execute(Company $company, array $data, User $user): Company
    {
        return DB::transaction(function () use ($company, $data, $user) {
            $company->fill($data);

            $changes = $company->getDirty();

            if ($changes === []) {
                return $company;
            }

            $old = Arr::only($company->getOriginal(), array_keys($changes));

            $company->save();

            $this->audit->log(
                event: 'company_update',
                user: $user,
                company: $company,
                old: $old,
                new: $changes,
            );

            return $company->refresh();
        });
    }
}