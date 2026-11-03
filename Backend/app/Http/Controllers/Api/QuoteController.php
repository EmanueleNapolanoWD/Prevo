<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\CreateQuoteAction;
use App\Domains\Quotes\Actions\DeleteQuoteAction;
use App\Domains\Quotes\Actions\UpdateQuoteAction;
use App\Domains\Quotes\Data\CreateQuoteData;
use App\Domains\Quotes\Models\Quote;
use App\Domains\Quotes\Requests\CreateQuoteRequest;
use App\Domains\Quotes\Requests\UpdateQuoteRequest;
use App\Domains\Quotes\Resources\QuoteResource;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuoteController extends Controller
{

    // recupero tutti i quotes
    public function index(Company $company): AnonymousResourceCollection
    {
        $quotes = Quote::query()
            ->where('company_id', $company->id)
            ->latest()
            ->paginate();

        return QuoteResource::collection($quotes);
    }

    //recupero singolo quote by DI
    public function show(Company $company, string $quoteId): QuoteResource
    {
        $quote = Quote::query()
            ->where('company_id', $company->id)
            ->with(['client.emails', 'client.phones', 'client.addresses', 'items'])
            ->findOrFail($quoteId);

        return new QuoteResource($quote);
    }

    public function store(
        CreateQuoteRequest $request,
        Company $company,
        CreateQuoteAction $action
    ): JsonResponse {

        $quote = $action->execute(
            $company,
            $request->user(),
            CreateQuoteData::fromArray($request->validated()),
        );

        return QuoteResource::make($quote)
            ->response()
            ->setStatusCode(201);
    }

    public function update(
        UpdateQuoteRequest $request,
        UpdateQuoteAction $action,
        Company $company,
        string $quoteId
    ): QuoteResource|JsonResponse {
        $quote = Quote::query()
            ->where('company_id', $company->id)
            ->findOrFail($quoteId);

        $this->authorize('update', $quote);

        try {
            $quote = $action->execute(
                $quote,
                $request->user(),
                CreateQuoteData::fromArray($request->validated()),
                $request->integer('version') ?: null
            );
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 409);
        }

        return new QuoteResource($quote);
    }

    public function delete(
        Request $request,
        Company $company,
        string $quoteId,
        DeleteQuoteAction $action
    ): JsonResponse {
        $quote = Quote::query()
            ->where('company_id', $company->id)
            ->findOrFail($quoteId);

        $this->authorize('delete', $quote);

        try {
            $action->execute($quote, $request->user(), $company);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);
        }

        return response()->json(null, 204);
    }
}
