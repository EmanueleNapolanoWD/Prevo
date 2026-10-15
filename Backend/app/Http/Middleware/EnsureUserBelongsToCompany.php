<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToCompany
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $company = $request->route('company');

        abort_unless(
            $company && $request->user()->companies()->whereKey($company->id)->exists(),
            404
        );

        return $next($request);
    }
}
