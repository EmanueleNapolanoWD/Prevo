<?php

namespace App\Http\Controllers\Api\Ai;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\GenerateQuoteDraftAction;
use App\Domains\Quotes\Requests\GenerateQuoteDraftRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Throwable;

class QuoteAiController extends Controller
{
    public function draft(
        string $slug,
        GenerateQuoteDraftRequest $request,
        GenerateQuoteDraftAction $action,
    ) {
        $company = Company::query()
            ->where('slug', $slug)
            ->firstOrFail();

        // Deve verificare anche che l'utente appartenga a $company
        //Gate::authorize('create', [Quote::class, $company]);

        try {
            $draft = $action->handle($company, $request->validated('prompt'));
        } catch (Throwable $e) {
            Log::error('Generazione bozza AI fallita', [
                'company_id' => $company->id,
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Non sono riuscito a generare la bozza. Riprova tra qualche istante.',
            ], 502);
        }

        return response()->json(['data' => $draft]);
    }
}