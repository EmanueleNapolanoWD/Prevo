<?php

namespace App\Http\Controllers\Api;

use App\Domains\Clients\Actions\CreateClientAction;
use App\Domains\Clients\Actions\UpdateClientAction;
use App\Domains\Clients\Models\Client;
use App\Domains\Clients\Requests\StoreClientRequest;
use App\Domains\Clients\Requests\UpdateClientRequest;
use App\Domains\Clients\Resources\ClientResources;
use App\Domains\Companies\Models\Company;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{

    public function index(
        Request $request,
        Company $company
    ): ClientResources {
        $this->ensureCompanyMembership($request, $company->id);

        $this->authorize('viewAny', [
            Client::class,
            $company->id,
        ]);

        $clients = $company->clients()
            ->with(['emails', 'phones', 'addresses'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%' . $request->string('q')->trim() . '%';
                $query->where(fn($q) => $q
                    ->where('name', 'like', $term)
                    ->orWhere('surname', 'like', $term)
                    ->orWhere('company_name', 'like', $term));
            })
            ->when($request->filled('type'), fn($query) => $query->where('type', $request->string('type')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return new ClientResources($clients);
    }

    public function store(
        StoreClientRequest $request,
        CreateClientAction $action,
        Company $company
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $company->id);

        $this->authorize('create', [
            Client::class,
            $company->id
        ]);

        $company = Company::query()
            ->findOrFail($company->id);

        $client = $action->execute($company, $request->validated());

        return (new ClientResources($client))
            ->additional(['message' => 'Cliente aggiunto correttamente'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(
        Request $request,
        Company $company,
        string $clientId
    ): ClientResources {
        $this->ensureCompanyMembership($request, $company->id);

        $client = $company->clients()
            ->with(['emails', 'phones', 'addresses'])
            ->findOrFail($clientId);

        $this->authorize('view', $client);

        return new ClientResources($client);
    }

    public function update(
        UpdateClientRequest $request,
        UpdateClientAction $action,
        Company $company,
        string $clientId
    ): ClientResources {
        $this->ensureCompanyMembership($request, $company->id);

        $client = $company->clients()->findOrFail($clientId);

        $this->authorize('update', $client);

        $client = $action->execute($client, $request->validated());

        return (new ClientResources($client))->additional(['message' => 'Cliente aggiornato con successo!']);
    }

    public function destroy(
        Request $request,
        Company $company,
        string $clientId
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $company->id);

        $client = $company->clients()->findOrFail($clientId);

        $this->authorize('delete', $client);

        $client->delete();

        return response()->json(null, 204);
    }

    private function ensureCompanyMembership(
        Request $request,
        string $companyId
    ): void {
        $isMember = $request->user()
            ->companies()
            ->where('companies.id', $companyId)
            ->exists();

        abort_unless($isMember, 404);
    }
}
