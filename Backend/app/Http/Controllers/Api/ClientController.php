<?php

namespace App\Http\Controllers\Api;

use App\Domains\Clients\Models\Client;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(
        Request $request,
        string $companyId
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $companyId);

        $this->authorize('viewAny', [
            Client::class,
            $companyId,
        ]);

        $clients = Client::query()
            ->where('company_id', $companyId)
            ->paginate(15);

        return response()->json($clients);
    }

    public function show(
        Request $request,
        string $companyId,
        string $clientId
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $companyId);

        $client = Client::query()
            ->where('company_id', $companyId)
            ->findOrFail($clientId);

        $this->authorize('view', $client);

        return response()->json($client);
    }

    public function update(
        Request $request,
        string $companyId,
        string $clientId
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $companyId);

        $client = Client::query()
            ->where('company_id', $companyId)
            ->findOrFail($clientId);

        $this->authorize('update', $client);

        $validated = $request->validate([
            'type' => ['sometimes', 'required', 'string', 'max:30'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'surname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
                Rule::unique('clients', 'email')
                    ->ignore($client->id)
                    ->whereNull('deleted_at'),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'required', 'string', 'max:10'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'province' => ['sometimes', 'required', 'string', 'size:2'],
            'tax_code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'vat_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'note' => ['sometimes', 'nullable', 'string'],
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Cliente aggiornato correttamente.',
            'data' => $client->fresh(),
        ]);
    }

    public function destroy(
        Request $request,
        string $companyId,
        string $clientId
    ): JsonResponse {
        $this->ensureCompanyMembership($request, $companyId);

        $client = Client::query()
            ->where('company_id', $companyId)
            ->findOrFail($clientId);

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
