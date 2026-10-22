<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UpdateCompanyAction
{

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }


    public function execute(Company $company, array $data, User $user): Company
    {
        return DB::transaction(function () use ($company, $data, $user) {
            // Genera un nuovo slug soltanto se cambia il nome.
            if (
                isset($data['name']) &&
                $data['name'] !== $company->name
            ) {
                $data['slug'] = $this->generateUniqueSlug(
                    $data['name'],
                    $company->id,
                );
            }

            $company->fill($data);

            $changes = $company->getDirty();

            if ($changes === []) {
                return $company;
            }

            $old = Arr::only(
                $company->getOriginal(),
                array_keys($changes),
            );

            $company->save();

            $this->audit->log(
                event: 'company_update',
                user: $user,
                company: $company,
                auditable: $company,
                old: $old,
                new: $changes,
            );

            return $company->refresh();
        });
    }

    private function generateUniqueSlug(string $name, string $companyId): string
    {
        $baseSlug = Str::slug($name);

        // Gestisce nomi composti esclusivamente da caratteri non convertibili.
        if ($baseSlug === '') {
            $baseSlug = 'azienda';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Company::query()
                ->where('slug', $slug)
                ->where('id', '!=', $companyId)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}