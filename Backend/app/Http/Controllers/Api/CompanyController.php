<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Actions\UpdateCompanyAction;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Requests\CompanyRequest;
use App\Domains\Companies\Resources\CompanyResource;
use App\Http\Controllers\Controller;

class CompanyController extends Controller
{


    /**
     * Recupero dati azienda.
     */
    public function getCompanyData(
        Company $company
    ): CompanyResource {

        $this->authorize('viewCompanyData', $company);
        return new CompanyResource($company);
    }

    /**
     * Modifica dati azienda.
     */
    public function updateCompanyData(
        CompanyRequest $request,
        Company $company,
        UpdateCompanyAction $action,
    ): CompanyResource {
        $this->authorize('updateCompanyData', $company);

        $company = $action->execute(
            company: $company,
            data: $request->safe()->except(['logo', 'remove_logo']),
            user: $request->user(),
            logo: $request->file('logo'),
            removeLogo: $request->boolean('remove_logo'),
        );

        return new CompanyResource($company);
    }


}