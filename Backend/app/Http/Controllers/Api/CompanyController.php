<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Actions\UpdateCompanyAction;
use App\Domains\Companies\Actions\UpdateCompanySettingsAction;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Requests\CompanyRequest;
use App\Domains\Companies\Requests\CompanySettingsRequest;
use App\Domains\Companies\Resources\CompanyResource;
use App\Domains\Companies\Resources\CompanySettingsResource;
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

        $validated = $request->validated();

        $company = $action->execute(
            $company,
            $validated,
            $request->user()
        );

        return new CompanyResource($company);
    }

    /**
     * Recupera le impostazioni dell'azienda.
     */
    public function getCompanySettings(
        Company $company
    ): CompanySettingsResource {
        return new CompanySettingsResource(
            $company->companySettings()->firstOrFail()
        );
    }

    /**
     * Aggiorna le impostazioni dell'azienda.
     */
    public function updateCompanySettings(
        CompanySettingsRequest $request,
        Company $company,
        UpdateCompanySettingsAction $action
    ): CompanySettingsResource {

        $this->authorize('updateSettings', $company);

        $settings = $action->execute($company, $request->user(), $request->validated());

        return new CompanySettingsResource($settings);
    }
}