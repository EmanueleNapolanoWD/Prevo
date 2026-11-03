<?php

namespace App\Domains\Audit\Services;

use App\Domains\Audit\Models\Audit;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Throwable;

class AuditLogger
{

    public function log(
        string $event,
        ?User $user = null,
        ?Company $company = null,
        ?Model $auditable = null,
        ?array $old = null,
        ?array $new = null,
        array $metadata = [],
    ): void {
        try {
            $companyId = $company?->getKey()
                ?? ($auditable instanceof Company ? $auditable->getKey() : $auditable?->company_id);

            $request = request();

            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => $user->getKey(),
                'event' => $event,
                'auditable_type' => $auditable->getMorphClass(),
                'auditable_id' => $auditable->getKey(),
                'old_values' => $old,
                'new_values' => $new,
                'metadata' => $metadata ?: null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (Throwable $e) {
            report($e);
        }
    }
}