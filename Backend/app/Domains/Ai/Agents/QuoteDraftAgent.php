<?php

namespace App\Domains\Ai\Agents;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Prompts\QuoteDraftPrompt;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[MaxTokens(2048)]
#[Temperature(0.2)]
#[Timeout(60)]
final class QuoteDraftAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        private Company $company,
    ) {
    }

    public function instructions(): Stringable|string
    {
        return QuoteDraftPrompt::for($this->company);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()
                ->description('Titolo breve del preventivo')
                ->required(),

            'description' => $schema->string()
                ->description('Descrizione professionale generale del lavoro oggetto del preventivo')
                ->required(),

            'notes' => $schema->string()
                ->description('Condizioni utili emerse dalla richiesta; stringa vuota se non ce ne sono'),

            'valid_days' => $schema->integer()->min(1)->max(365)
                ->description('Giorni di validità del preventivo'),

            'client_name' => $schema->string()
                ->description('Nome e cognome del cliente citato nella richiesta; stringa vuota se non c\'è'),

            'items' => $schema->array()->items($schema->object([
                'name' => $schema->string()
                    ->description('Nome breve e identificativo della prestazione o del prodotto')
                    ->required(),
                'description' => $schema->string()
                    ->description('Cosa viene consegnato, in italiano')
                    ->required(),
                'quantity' => $schema->number()->min(0.01)
                    ->description('Quantità, ore o giorni')
                    ->required(),
                'unit_price' => $schema->number()->min(0)
                    ->description('Prezzo unitario in EURO, IVA esclusa. Mai in centesimi')
                    ->required(),
                'vat_rate' => $schema->number()->min(0)->max(30)
                    ->description('Aliquota IVA in percentuale, es. 22'),
                'product_id' => $schema->string()
                    ->description('UUID del prodotto, solo se preso dal listino; altrimenti stringa vuota'),
            ]))->required(),
        ];
    }
}