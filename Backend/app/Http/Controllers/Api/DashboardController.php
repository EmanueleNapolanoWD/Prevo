<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Dashboard\Actions\DashboardChartAction;
use App\Domains\Dashboard\Actions\DashboardInsightsAction;
use App\Domains\Dashboard\Actions\DashboardKpisAction;
use App\Domains\Dashboard\Actions\DashboardRecentAction;
use App\Domains\Dashboard\Actions\DashboardTodosAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function kpis(
        Company $company,
        Request $request
    ): JsonResponse {

        $range = $request->string('range', '30d')->toString();

        $user = $this->resolveUser($request, $company);

        $action = new DashboardKpisAction($company, $user);

        $result = $action->execute($range);

        return response()->json($result);
    }

    public function chart(
        Company $company,
        Request $request
    ): JsonResponse {

        $range = $request->string('range', '30d')->toString();
        $user = $this->resolveUser($request, $company);

        Log::debug('[Dashboard Chart] Richiesta', [
            'company_id' => $company->id,
            'company_slug' => $company->slug,
            'user_id' => $user?->id,
            'range' => $range,
        ]);

        $action = new DashboardChartAction($company, $user);

        $result = $action->execute($range);

        Log::debug('[Dashboard Chart] Risultato', [
            'company_id' => $company->id,
            'user_id' => $user?->id,
            'result' => $result,
        ]);

        return response()->json($result);
    }

    private function resolveUser(Request $request, Company $company): ?User
    {
        $user = $request->user();

        if ($user === null) {
            return null;
        }

        $role = $request->attributes->get('company')?->pivot?->role;

        if ($role !== 'OWNER') {
            return $user;
        }

        return null;
    }
}