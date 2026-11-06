<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\UpdateQuoteSettingsAction;
use App\Domains\Quotes\Models\QuoteSettings;
use App\Domains\Quotes\Requests\QuoteSettingsRequest;
use App\Domains\Quotes\Resources\QuoteSettingsResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class QuoteSettingsController extends Controller
{
    /**
     * Recupera le impostazioni dell'azienda.
     */
    public function show(
        Company $company
    ): QuoteSettingsResource {
        $settings = QuoteSettings::firstOrCreate([
            'company_id' => $company->id,
        ]);

        $settings->refresh()->load([
            'company.emails',
            'company.phones',
            'company.addresses',
        ]);

        Log::debug('Quote settings loaded', [
            'settings' => $settings->toArray(),
        ]);

        // refresh() serve: firstOrCreate restituisce il model solo con i campi
        // inseriti, senza i default impostati dal database (prefix, padding, colori...)
        return new QuoteSettingsResource($settings->refresh());
    }

    /**
     * Aggiorna le impostazioni dell'azienda.
     */
    public function update(
        QuoteSettingsRequest $request,
        Company $company,
        UpdateQuoteSettingsAction $action
    ): QuoteSettingsResource {

        $this->authorize('updateSettings', $company);

        $settings = $action->execute($company, $request->user(), $request->validated());

        return new QuoteSettingsResource($settings->load('company'));
    }
}
