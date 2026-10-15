<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Models\CompanySettings;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateCompanySettingsAction
{
    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(
        Company $company,
        User $user,
        array $data
    ): CompanySettings {
        $settings = DB::transaction(function () use ($company, $user, $data, &$old, &$changes) {

            // fallback : se non fosse stata creata al insertoCompanies
            $settings = $company->companySettings ?? $company->companySettings()->make();

            $settings->fill($data);
            $changes = $settings->getDirty();
            $old = Arr::only($settings->getOriginal(), array_keys($changes));

            if ($changes !== []) {
                $settings->save();
            }
            return $settings;
        });

        if($changes !== []){
            $this->audit->log(
                event: 'company_settings.updated',
                user: $user,
                company: $company,
                auditable: $settings,
                old: $old,
                new: $changes,
            );
        }

        return $settings;
    }
}