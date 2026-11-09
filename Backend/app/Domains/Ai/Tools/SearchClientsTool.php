<?php

namespace App\Domains\Ai\Tools;

use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchClientsTool implements Tool
{

    // costruttore per associare azineda
    public function __construct(
        private Company $company
    ) {
    }
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Cerca un cliente dell\'azienda per nome o cognome. Restituisce id, nome e cognome. '
            . 'Usalo solo se l\'utente nomina un cliente; non inventare mai un id.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $terms = preg_split('/\s+/', trim((string) $request['query']), -1, PREG_SPLIT_NO_EMPTY);

        if (empty($terms)) {
            return 'Nessun cliente Trovato!';
        }

        $clients = Client::query()
            ->where('company_id', $this->company->id)
            ->where(function ($query) use ($terms) {
                foreach ($terms as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';


                    $query->where(fn($q) => $q
                        ->where('name', 'like', $like)
                        ->orWhere('surname', 'like', $like));
                }
            })
            ->limit(10)
            ->get(['id', 'name', 'surname']);

        if ($clients->isEmpty()) {
            return 'Nessun Cliente Trovato!';
        }

        return $clients->toJson();
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('Nome e/o cognome del cliente da cercare')
                ->required(),
        ];
    }
}
