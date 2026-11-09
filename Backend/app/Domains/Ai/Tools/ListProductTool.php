<?php

namespace App\Domains\Ai\Tools;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class ListProductTool implements Tool
{

    // costruttore per vincolare richieste all'azienda
    public function __construct(
        private Company $company
    ) {
    }
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Cerca nel listino dell\'azienda prodotti o servizi per parole chiave. '
            . 'Restituisce id, nome, prezzo e IVA. Usa una o due parole chiave per volta '
            . '(es. "sito", "seo") e richiama lo strumento per ogni servizio diverso.';
    }


    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $terms = preg_split('/\s+/', trim((string) $request['query']), -1, PREG_SPLIT_NO_EMPTY);

        if (empty($terms)) {
            return 'Nessun prodotto trovato.';
        }

        $products = Product::query()
            ->where('company_id', $this->company->id)
            ->where('is_active', true)
            ->where(function ($query) use ($terms) {
                foreach ($terms as $term) {
                    $query->orWhere('name', 'like', '%' . addcslashes($term, '%_\\') . '%');
                }
            })
            ->limit(10)
            ->get([
                'id',
                'name',
                'sale_price',
                'vat_rate'
            ]);

        if ($products->isEmpty()) {
            return 'Nessun prodotto trovato nel listino per questa ricerca.';
        }

        return $products
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->sale_price !== null ? round($p->sale_price / 100, 2) : null,
                'vat_rate' => $p->vat_rate,
            ])
            ->toJson();
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('Una o due parole chiave del servizio da cercare')
                ->required(),
        ];
    }
}
