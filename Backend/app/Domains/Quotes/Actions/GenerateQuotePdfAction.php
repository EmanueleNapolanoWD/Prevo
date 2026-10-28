<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Quotes\Models\Quote;
use BackedEnum;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Spatie\LaravelPdf\Facades\Pdf;

class GenerateQuotePdfAction
{
    private const TEMPLATES = ['classic', 'modern', 'minimal'];

    public function execute(Quote $quote): string
    {
        $quote->loadMissing(['items', 'company.quoteSettings']);

        $template = $quote->template instanceof BackedEnum ? $quote->template->value : (string) $quote->template;
        $template = in_array($template, self::TEMPLATES, true) ? $template : 'classic';

        $items = $quote->items->sortBy('sort_order')->values();
        $company = $quote->company;
        $settings = $company?->quoteSettings;
        $client = $this->clientSnapshot($quote);
        $clientName = data_get($client, 'display_name')
            ?: data_get($client, 'name')
            ?: '—';

        $path = sprintf(
            'companies/%s/quotes/%s/%s-v%d.pdf',
            $quote->company_id,
            $quote->id,
            str($quote->number)->slug(),
            $quote->version,
        );

        Pdf::view("pdf.quotes.{$template}", [
            'quote' => $quote,
            'company' => $company,
            'settings' => $settings,
            'items' => $items,
            'totals' => $this->buildTotals($quote, $items),
            'colors' => [
                // validati: finiscono dentro un tag <style>
                'primary' => $this->safeColor($quote->primary_color, '#1f2937'),
                'accent' => $this->safeColor($quote->accent_color, '#3b82f6'),
            ],
            'logo' => $this->logoDataUrl($company),
            'companyLines' => $this->companyLines($company),
            'clientName' => $clientName,
            'clientLines' => $this->clientLines($quote, $client),
            'dates' => [
                'issued' => $this->date($quote->issue_date ?? $quote->created_at),
                'valid_until' => $this->date($quote->valid_until),
            ],
            // helper di formattazione usati dalle view
            'money' => fn($v) => $this->money($v),          // input: centesimi
            'euros' => fn($v) => $this->moneyFromEuros($v), // input: euro (es. discount_value Fixed)
            'qty' => fn($v) => $this->qty($v),
            'discountLabel' => fn($item) => $this->discountLabel($item),
        ])
            ->footerView('pdf.quotes.footer', ['quote' => $quote, 'company' => $company])
            ->format('a4')
            ->margins(15, 12, 20, 12)
            ->disk('r2-quotes')
            ->save($path);

        $quote->forceFill(['pdf_path' => $path])->saveQuietly();

        return $path;
    }

    // ---------------------------------------------------------------- totali

    /**
     * Tutti gli importi restituiti sono in centesimi (int).
     * Usa i totali persistiti dal QuoteTotalsCalculator; le somme sulle righe
     * servono solo come fallback e per il dettaglio IVA.
     */
    private function buildTotals(Quote $quote, Collection $items): array
    {
        $linesGross = $items->sum(fn($i) => (int) round((float) $i->quantity * $this->cents($i->unit_price)));
        $linesNet = $items->sum(fn($i) => $this->cents($i->subtotal));
        $linesTax = $items->sum(fn($i) => $this->cents($i->tax_amount));

        $surcharge = $this->cents($quote->surcharge);
        $stamp = $this->cents($quote->stamp_duty);

        $taxable = $quote->taxable_amount !== null
            ? $this->cents($quote->taxable_amount)
            : $linesNet + $surcharge;

        $total = $quote->total !== null ? $this->cents($quote->total) : null;

        $tax = $quote->tax_total !== null
            ? $this->cents($quote->tax_total)
            : ($total !== null ? $total - $taxable : $linesTax);

        $total ??= $taxable + $tax;

        $subtotal = $quote->subtotal !== null
            ? $this->cents($quote->subtotal)
            : $linesGross;

        $discount = $quote->discount_total !== null
            ? $this->cents($quote->discount_total)
            : max(0, $subtotal - ($taxable - $surcharge));

        return [
            'gross' => $subtotal,
            'discount' => $discount,
            'has_discounts' => $discount > 0,
            'net' => $taxable - $surcharge, // righe al netto degli sconti, senza maggiorazione
            'surcharge' => $surcharge,
            'taxable' => $taxable,
            'vat' => $this->vatBreakdown($quote, $items, $surcharge, $tax),
            'tax' => $tax,
            'total' => $total,
            'stamp_duty' => $stamp,
            // se il bollo non è incluso in `total` (il calculator non lo conteggia)
            'payable' => $total + $stamp,
        ];
    }

    /** Riepilogo IVA per aliquota, riconciliato su $taxTotal (il calculator calcola l'IVA per gruppo). */
    private function vatBreakdown(Quote $quote, Collection $items, int $surcharge, int $taxTotal): array
    {
        $groups = [];

        foreach ($items as $item) {
            $key = number_format((float) $item->vat_rate, 2, '.', '');
            $groups[$key] ??= ['base' => 0, 'tax' => 0];
            $groups[$key]['base'] += $this->cents($item->subtotal);
            $groups[$key]['tax'] += $this->cents($item->tax_amount);
        }

        // la maggiorazione è imponibile con l'aliquota di default
        $defaultRate = data_get($quote, 'default_vat_rate') ?? data_get($quote, 'vat_rate');
        if ($surcharge > 0 && $defaultRate !== null) {
            $key = number_format((float) $defaultRate, 2, '.', '');
            $groups[$key] ??= ['base' => 0, 'tax' => 0];
            $groups[$key]['base'] += $surcharge;
        }

        if ($groups === []) {
            return [];
        }

        // l'ultimo gruppo assorbe i centesimi di differenza (tax_total è calcolato per aliquota)
        $lastKey = array_key_last($groups);
        $groups[$lastKey]['tax'] += $taxTotal - array_sum(array_column($groups, 'tax'));

        $out = [];
        foreach ($groups as $rate => $g) {
            $out[] = [
                'rate' => str_replace('.', ',', rtrim(rtrim($rate, '0'), '.')),
                'base' => $g['base'],
                'tax' => $g['tax'],
            ];
        }

        return $out;
    }

    // ---------------------------------------------------------------- indirizzi / righe anagrafiche

    /**
     * Compone "Via Roma 1, 80100 Napoli (NA)" da stringa o da array con chiavi alternative.
     */
    private function address(mixed $address): ?string
    {
        if (!is_array($address)) {
            return filled($address) ? trim((string) $address) : null;
        }

        $pick = fn(array $keys) => collect($keys)
            ->map(fn($k) => $address[$k] ?? null)
            ->first(fn($v) => filled($v));

        $street = $pick(['street', 'address', 'address_line', 'line1']);
        $line2 = $pick(['line2']);
        $zip = $pick(['postal_code', 'zip', 'cap']);
        $city = $pick(['city', 'comune']);
        $province = $pick(['province', 'provincia', 'state']);

        $province = $province ? (strlen((string) $province) === 2 ? strtoupper($province) : $province) : null;

        $cityLine = trim(implode(' ', array_filter([$zip, $city])));
        if ($province && $cityLine !== '') {
            $cityLine .= " ({$province})";
        } elseif ($province) {
            $cityLine = $province;
        }

        return implode(', ', array_filter([$street, $line2, $cityLine])) ?: null;
    }

    /** L'azienda può avere l'indirizzo come array/stringa unica oppure in colonne separate. */
    private function companyAddress($company): ?string
    {
        $raw = data_get($company, 'address');

        if (is_array($raw)) {
            return $this->address($raw);
        }

        return $this->address([
            'street' => $raw,
            'postal_code' => data_get($company, 'postal_code') ?? data_get($company, 'zip') ?? data_get($company, 'cap'),
            'city' => data_get($company, 'city'),
            'province' => data_get($company, 'province'),
        ]);
    }

    private function companyLines($company): array
    {
        $vat = data_get($company, 'vat_number');
        $taxCode = data_get($company, 'tax_code');

        return array_values(array_filter([
            $this->companyAddress($company),
            filled($vat) ? 'P.IVA ' . trim((string) $vat) : null,
            filled($taxCode) ? 'C.F. ' . trim((string) $taxCode) : null,
            data_get($company, 'email'),
            data_get($company, 'phone'),
        ], fn($v) => filled($v)));
    }

    private function clientLines(Quote $quote, array $client): array
    {
        $vat = data_get($client, 'vat_number');
        $taxCode = data_get($client, 'tax_code');

        return array_values(array_filter([
            $this->address(data_get($client, 'address') ?: $quote->contact_address),
            filled($vat) ? 'P.IVA ' . trim((string) $vat) : null,
            filled($taxCode) ? 'C.F. ' . trim((string) $taxCode) : null,
            data_get($client, 'email') ?: $quote->contact_email,
            data_get($client, 'phone') ?: $quote->contact_phone,
        ], fn($v) => filled($v)));
    }

    private function logoDataUrl($company): ?string
    {
        $path = data_get($company, 'logo_path');

        if (!$path || !Storage::exists($path)) {
            return null;
        }

        return 'data:' . Storage::mimeType($path) . ';base64,' . base64_encode(Storage::get($path));
    }

    private function clientSnapshot(Quote $quote): array
    {
        $snapshot = $quote->client_snapshot;

        if (is_string($snapshot)) {
            $snapshot = json_decode($snapshot, true);
        }

        return is_array($snapshot) ? $snapshot : [];
    }

    // ---------------------------------------------------------------- formattazione

    private function safeColor(?string $color, string $fallback): string
    {
        return is_string($color) && preg_match('/^#[0-9a-fA-F]{6}$/', $color) ? $color : $fallback;
    }

    private function date(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->format('d/m/Y') : null;
    }

    /** Unico punto in cui si decide l'unità degli importi persistiti: oggi centesimi. */
    private function cents(mixed $value): int
    {
        return (int) round((float) ($value ?? 0));
    }

    /** Formatta un importo in centesimi. */
    private function money(mixed $cents): string
    {
        return "€\u{00A0}" . number_format($this->cents($cents) / 100, 2, ',', '.');
    }

    /** Formatta un importo già in euro (es. sconto Fixed). */
    private function moneyFromEuros(mixed $euros): string
    {
        return "€\u{00A0}" . number_format((float) $euros, 2, ',', '.');
    }

    private function qty(mixed $value): string
    {
        return rtrim(rtrim(number_format((float) $value, 3, ',', '.'), '0'), ',');
    }

    private function discountLabel($item): string
    {
        $value = (float) $item->discount_value;

        if ($value <= 0) {
            return '—';
        }

        $type = $item->discount_type instanceof BackedEnum
            ? $item->discount_type->value
            : (string) $item->discount_type;

        return str_contains(strtolower($type), 'perc')
            ? $this->qty($value) . '%'
            : $this->moneyFromEuros($value); // il calculator tratta Fixed come euro
    }
}