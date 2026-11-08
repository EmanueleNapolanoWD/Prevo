<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Dashboard\Actions\DashboardChartAction;
use App\Domains\Dashboard\Actions\DashboardKpisAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $action = new DashboardChartAction($company, $user);

        $result = $action->execute($range);

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