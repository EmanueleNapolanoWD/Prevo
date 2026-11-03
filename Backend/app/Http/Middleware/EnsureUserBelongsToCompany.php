<?php

namespace App\Http\Middleware;

use App\Domains\Companies\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToCompany
{
    /**
     * Risolve la company dalla rotta (modello, UUID o slug) e verifica
     * che l'utente autenticato ne faccia parte. In ogni caso di fallimento
     * risponde 404, per non rivelare quali company esistono.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        abort_unless($user, 401);

        $parameter = $request->route('company');
        abort_unless($parameter, 404);

        $value = $parameter instanceof Company
            ? (string) $parameter->getKey()
            : (string) $parameter;


        // Una sola query: la membership è già nel vincolo della relazione.
        $company = $user->companies()
            ->when(
                Str::isUuid($value),
                fn($query) => $query->where('companies.id', $value),
                fn($query) => $query->where('companies.slug', $value),
            )
            ->first();

        abort_unless($company, 404);

        // Disponibile nei controller con $request->attributes->get('company').
        // Il ruolo dell'utente è in $company->pivot->role.
        $request->attributes->set('company', $company);

        return $next($request);
    }
}