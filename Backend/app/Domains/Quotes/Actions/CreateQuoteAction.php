<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Data\CalculatedLine;
use App\Domains\Quotes\Data\CreateQuoteData;
use App\Domains\Quotes\Enums\QuoteStatus;
use App\Domains\Quotes\Models\Quote;
use App\Domains\Quotes\Models\QuoteSettings;
use App\Domains\Quotes\Supports\Money;
use App\Domains\Quotes\Supports\QuoteNumberGenerator;
use App\Domains\Quotes\Supports\QuoteTotalsCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class CreateQuoteAction
{

    public function __construct(
        private readonly QuoteNumberGenerator $numGenerator,
        private readonly QuoteTotalsCalculator $calculator,
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(Company $company, User $user, CreateQuoteData $data): Quote
    {
        return DB::transaction(function () use ($company, $user, $data) {

            // ricerca cliente appartenente a company
            $client = Client::query()
                ->where('company_id', $company->id)
                ->findOrFail($data->clientId);

            // Impostazioni dell'azienda, con lock di riga: servono sia ai default sia al contator
            $settings = QuoteSettings::forCompanyForUpdate($company);

            $vatRate = $data->vatRate ?? (float) $settings->default_vat_rate;

            $totals = $this->calculator->calculate(
                $data->items,
                $data->surchargeCents,
                $vatRate,
                $settings->prices_include_vat,
            );

            $quote = Quote::create([
                'company_id' => $company->id,
                'client_id' => $client->id,
                'created_by' => $user->id,
                'template' => $data->appearance['template'] ?? $settings->default_quote_template,
                'primary_color' => $data->appearance['primary_color'] ?? $settings->quote_primary_color,
                'accent_color' => $data->appearance['accent_color'] ?? $settings->default_accent_color,
                'number' => $this->numGenerator->next($settings),
                'version' => 1,
                'status' => QuoteStatus::Draft,
                'title' => $data->title,
                'description' => $data->description,
                'notes' => $data->notes,
                'terms' => $data->terms,
                'valid_until' => $this->validUntil($data, $settings),
                'contact_email' => $data->contact['email'] ?? null,
                'contact_phone' => $data->contact['phone'] ?? null,
                'contact_address' => $data->contact['address'] ?? null,
                'client_snapshot' => $this->clientSnapShot($client, $data),
                'subtotal' => Money::toDecimal($totals->subtotal),
                'discount_total' => Money::toDecimal($totals->discountTotal),
                'taxable_amount' => Money::toDecimal($totals->taxableAmount),
                'tax_total' => Money::toDecimal($totals->taxTotal),
                'total' => Money::toDecimal($totals->total),
                'currency' => $settings->default_currency,
            ]);

            // creazioen quote items
            $quote->items()->createMany(
                array_map(fn(CalculatedLine $line) => $line->toArray(), $totals->lines),
            );

            // quote history
            $quote->statusHistory()->create([
                'from_status' => null,
                'to_status' => QuoteStatus::Draft->value,
                'changed_by' => $user->id,
                'reason' => 'Quote Creata',
            ]);

            // audit
            $this->audit->log(
                event: 'quote.created',
                user: $user,
                company: $company,
                auditable: $quote,
                new: [
                    'number' => $quote->number,
                    'title' => $quote->title,
                    'client_id' => $quote->client_id,
                    'status' => $quote->status->value,
                    'total' => $quote->total,
                    'currency' => $quote->currency,
                ],
                metadata: ['items_count' => count($totals->lines)],
            );

            return $quote->load('items');
        });
    }

    /**
     * Scadenza a fine giornata nel fuso dell'azienda, poi convertita nel fuso dell'app:
     * Eloquent salva la data così com'è, senza convertirla da solo.
     */

    private function validUntil(CreateQuoteData $data, QuoteSettings $settings): CarbonImmutable
    {
        $tz = $settings->timezone;

        $date = $data->validUntil !== null
            ? CarbonImmutable::parse($data->validUntil, $tz)
            : CarbonImmutable::now($tz)->addDays($settings->default_validity_days);

        return $date->endOfDay()->setTimezone(config('app.timezone'));
    }

    // snapshot cliente
    private function clientSnapShot(Client $client, CreateQuoteData $data): array
    {
        return [
            'id' => $client->id,
            'type' => $client->type instanceof \BackedEnum ? $client->type->value : $client->type,
            'display_name' => $client->display_name,
            'contact' => $data->contact,
        ];
    }

}