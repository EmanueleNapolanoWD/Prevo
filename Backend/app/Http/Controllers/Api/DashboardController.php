<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\DashboardChartAction;
use App\Domains\Quotes\Actions\DashboardInsightsAction;
use App\Domains\Quotes\Actions\DashboardKpisAction;
use App\Domains\Quotes\Actions\DashboardRecentAction;
use App\Domains\Quotes\Actions\DashboardTodosAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function kpis(
        Company $company,
        Request $request,
        DashboardKpisAction $action
    ): JsonResponse {
        $this->authorize('viewDashboard', $company);

        $range = $request->string('range', '30d');
        $user = $this->resolveUser($request, $company);

        return response()->json($action->execute($range, $user));
    }

    public function todos(
        Company $company,
        Request $request,
        DashboardTodosAction $action
    ): JsonResponse {
        $this->authorize('viewDashboard', $company);

        $user = $this->resolveUser($request, $company);

        return response()->json($action->execute($user));
    }

    public function recent(
        Company $company,
        Request $request,
        DashboardRecentAction $action
    ): JsonResponse {
        $this->authorize('viewDashboard', $company);

        $limit = $request->integer('limit', 8);
        $user = $this->resolveUser($request, $company);

        return response()->json($action->execute($limit, $user));
    }

    public function chart(
        Company $company,
        Request $request,
        DashboardChartAction $action
    ): JsonResponse {
        $this->authorize('viewDashboard', $company);

        $range = $request->string('range', '30d');
        $user = $this->resolveUser($request, $company);

        return response()->json($action->execute($range, $user));
    }

    public function insights(
        Company $company,
        Request $request,
        DashboardInsightsAction $action
    ): JsonResponse {
        $this->authorize('viewInsights', $company);

        $range = $request->string('range', '30d');
        $user = $this->resolveUser($request, $company);

        return response()->json($action->execute($range, $user));
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