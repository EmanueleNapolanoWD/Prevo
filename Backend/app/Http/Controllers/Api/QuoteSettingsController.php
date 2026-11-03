<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\UpdateQuoteSettingsAction;
use App\Domains\Quotes\Requests\QuoteSettingsRequest;
use App\Domains\Quotes\Resources\QuoteSettingsResource;
use App\Http\Controllers\Controller;

class QuoteSettingsController extends Controller
{
    /**
     * Recupera le impostazioni dell'azienda.
     */
    public function getQuoteSettings(
        Company $company
    ): QuoteSettingsResource {
        return new QuoteSettingsResource(
            $company->QuoteSettings()->firstOrFail()
        );
    }

    /**
     * Aggiorna le impostazioni dell'azienda.
     */
    public function updateQuoteSettings(
        QuoteSettingsRequest $request,
        Company $company,
        UpdateQuoteSettingsAction $action
    ): QuoteSettingsResource {

        $this->authorize('updateSettings', $company);

        $settings = $action->execute($company, $request->user(), $request->validated());

        return new QuoteSettingsResource($settings->load('company'));
    }
}
