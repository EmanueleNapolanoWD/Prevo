<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Quotes\Models\Quote;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Spatie\LaravelPdf\Facades\Pdf;

class GenerateQuotePdfAction
{

    private const TEMPLATES = ['classic', 'modern', 'minimal'];

    public function execute(Quote $quote): string
    {
        $quote->loadMissing(['items', 'company']);

        $template = $quote->template instanceof \BackedEnum ? $quote->template->value : (string) $quote->template;
        $template = in_array($template, self::TEMPLATES, true) ? $template : 'classic';

        $items = $quote->items->sortBy('sort_order')->values();
        $company = $quote->company;
        $client = $this->clientSnapshot($quote);

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
            'items' => $items,
            'totals' => $this->buildTotals($quote, $items),
            'colors' => [
                // validati: finiscono dentro un tag <style>
                'primary' => $this->safeColor($quote->primary_color, '#1f2937'),
                'accent' => $this->safeColor($quote->accent_color, '#3b82f6'),
            ],
            'logo' => $this->logoDataUrl($company),
            'companyLines' => $this->companyLines($company),
            'clientName' => data_get($client, 'display_name') ?: (data_get($client, 'name') ?: '—'),
            'clientLines' => $this->clientLines($quote, $client),
            'dates' => [
                'issued' => $this->date($quote->issue_date ?? $quote->created_at),
                'valid_until' => $this->date($quote->valid_until),
            ],
            // helper di formattazione usati dalle view
            'money' => fn($v) => $this->money($v),
            'qty' => fn($v) => $this->qty($v),
            'discountLabel' => fn($item) => $this->discountLabel($item),
        ])
            ->footerView('pdf.quotes.footer', ['quote' => $quote, 'company' => $company])
            ->format('a4')
            ->margins(15, 12, 20, 12)
            ->disk('local')
            ->save($path);

        $quote->forceFill(['pdf_path' => $path])->saveQuietly();

        return $path;
    }

    // HELPERS 

    // helpers per totali
    private function buildTotals(Quote $quote, Collection $items): array
    {
        $gross = $items->sum(fn($i) => (float) $i->quantity * (float) $i->unit_price);
        $net = $items->sum(fn($i) => (float) $i->subtotal);
        $tax = $items->sum(fn($i) => (float) $i->tax_amount);

        $vat = $items
            ->groupBy(fn($i) => number_format((float) $i->vat_rate, 2, '.', ''))
            ->map(fn($group, $rate) => [
                'rate' => str_replace('.', ',', rtrim(rtrim((string) $rate, '0'), '.')),
                'base' => $group->sum(fn($i) => (float) $i->subtotal),
                'tax' => $group->sum(fn($i) => (float) $i->tax_amount)
            ])
            ->values()
            ->all();

        $discount = max(0, round($gross - $net, 2));
        $surcharge = (float) ($quote->surcharge ?? 0);
        $stamp = (float) ($quote->stamp_duty ?? 0);

        return [
            'gross' => $gross,
            'discount' => $discount,
            'has_discounts' => $discount > 0.005,
            'net' => $net,
            'surcharge' => $surcharge,
            'vat' => $vat,
            'tax' => $tax,
            'stamp_duty' => $stamp,
            'total' => $quote->total !== null
                ? (float) $quote->total
                : round($net + $surcharge + $tax + $stamp, 2)
        ];
    }

    private function address(mixed $address): ?string
    {
        if (is_array($address)) {
            return collect(['street', 'address', 'line1', 'postal_code', 'zip', 'city', 'province', 'state'])
                ->map(fn($k) => $address[$k] ?? null)
                ->filter()
                ->implode(', ') ?: null;
        }

        return filled($address) ? (string) $address : null;
    }


    private function companyLines($company): array
    {
        return array_values(array_filter([
            $this->address(data_get($company, 'address')),
            data_get($company, 'vat_number') ? 'P.IVA ' . data_get($company, 'vat_number') : null,
            data_get($company, 'tax_code') ? 'C.F. ' . data_get($company, 'tax_code') : null,
            data_get($company, 'email'),
            data_get($company, 'phone'),
        ]));
    }

    private function clientLines(Quote $quote, array $client): array
    {
        return array_values(array_filter([
            $this->address(data_get($client, 'address') ?: $quote->contact_address),
            data_get($client, 'vat_number') ? 'P.IVA ' . data_get($client, 'vat_number') : null,
            data_get($client, 'tax_code') ? 'C.F. ' . data_get($client, 'tax_code') : null,
            data_get($client, 'email') ?: $quote->contact_email,
            data_get($client, 'phone') ?: $quote->contact_phone,
        ]));
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

    private function safeColor(?string $color, string $fallback): string
    {
        return is_string($color) && preg_match('/^#[0-9a-fA-F]{6}$/', $color) ? $color : $fallback;
    }

    private function date(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->format('d/m/Y') : null;
    }

    private function money(mixed $value): string
    {
        return "€\u{00A0}" . number_format((float) $value, 2, ',', '.');
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

        $type = $item->discount_type instanceof \BackedEnum
            ? $item->discount_type->value
            : (string) $item->discount_type;

        return str_contains(strtolower($type), 'perc')
            ? $this->qty($value) . '%'
            : $this->money($value);
    }


}