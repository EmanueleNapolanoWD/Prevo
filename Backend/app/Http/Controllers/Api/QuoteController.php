<?php

namespace App\Http\Controllers\Api;

use App\Domains\Quotes\Actions\CreateQuoteAction;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Data\CreateQuoteData;
use App\Domains\Quotes\Requests\CreateQuoteRequest;
use App\Domains\Quotes\Resources\QuoteResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class QuoteController extends Controller
{

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
}
