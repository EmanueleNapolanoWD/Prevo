<?php

namespace App\Domains\Quotes\Services;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Enums\QuoteTemplate;
use App\Domains\Quotes\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Mail\Attachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Throwable;

class QuotePdfService
{
    private const LOGO_DISK = 'r2-logos';

    /** Contenuto (byte) del PDF del preventivo, generato in locale senza servizi esterni. */
    public function render(Quote $quote): string
    {
        return Pdf::loadView('pdf.quote', $this->viewData($quote))
            ->setPaper('a4')
            // Incorpora solo i caratteri usati: il file resta leggero, adatto agli allegati email.
            ->setOption('isFontSubsettingEnabled', true)
            ->output();
    }

    /** Allegato email pronto all'uso: in una Mailable `->attach($pdf->attachment($quote))`. */
    public function attachment(Quote $quote): Attachment
    {
        return Attachment::fromData(fn () => $this->render($quote), $this->filename($quote))
            ->withMime('application/pdf');
    }

    public function filename(Quote $quote): string
    {
        return "preventivo-{$quote->number}.pdf";
    }

    /** Link pubblico temporaneo firmato (WhatsApp / mail). */
    public function publicUrl(Quote $quote, int $days = 7): string
    {
        $path = URL::temporarySignedRoute(
            'quotes.public.pdf',
            now()->addDays($days),
            ['company' => $quote->company->slug, 'quoteId' => $quote->id],
            absolute: false,
        );

        return rtrim(config('app.url'), '/') . $path;
    }

    /** @return array<string, mixed> */
    private function viewData(Quote $quote): array
    {
        $quote->loadMissing([
            'items',
            'company.primaryAddress',
            'company.primaryEmail',
            'company.primaryPhone',
            'company.quoteSettings',
        ]);

        $company = $quote->company;
        $settings = $company->quoteSettings;
        $vatRates = $quote->items->map(fn ($item) => (float) $item->vat_rate)->unique();

        return [
            'quote' => $quote,
            'company' => $company,
            'settings' => $settings,
            'template' => QuoteTemplate::tryFrom((string) $quote->template)?->value ?? QuoteTemplate::Classic->value,
            // I colori finiscono dentro un tag <style>: sono ammessi solo valori esadecimali.
            'primary' => $this->safeColor($quote->primary_color, '#1F2937'),
            'accent' => $this->safeColor($quote->accent_color, '#2563EB'),
            'logo' => $this->logoDataUri($company),
            'companyLines' => $this->companyLines($company),
            'clientName' => data_get($quote->client_snapshot, 'display_name'),
            'clientLines' => array_filter([$quote->contact_address, $quote->contact_email, $quote->contact_phone]),
            'validUntil' => $quote->valid_until?->format($settings?->date_format ?: 'd/m/Y'),
            // L'aliquota viene mostrata solo se è la stessa su tutte le righe.
            'vatRate' => $vatRates->count() > 1 ? null : ($vatRates->first() ?? (float) $quote->vat_rate),
        ];
    }

    /** @return list<string> */
    private function companyLines(Company $company): array
    {
        $address = $company->primaryAddress;
        $cityLine = $address ? trim("{$address->postal_code} {$address->city}") : '';

        if ($address?->province) {
            $cityLine .= " ({$address->province})";
        }

        $join = fn (array $parts, string $glue) => implode($glue, array_filter($parts));

        return array_values(array_filter([
            strcasecmp(trim((string) $company->legal_name), trim((string) $company->name)) !== 0 ? $company->legal_name : null,
            $join([$address?->address, $address?->address_extra, $cityLine], ', '),
            $join([
                $company->vat_number ? "P.IVA {$company->vat_number}" : null,
                $company->tax_code ? "C.F. {$company->tax_code}" : null,
            ], ' · '),
            $company->tax_regime ? "Regime fiscale: {$company->tax_regime}" : null,
            $join([
                $company->sdi_code ? "Codice SDI {$company->sdi_code}" : null,
                $company->pec ? "PEC {$company->pec}" : null,
            ], ' · '),
            $join([$company->primaryEmail?->email, $company->primaryPhone?->phone], ' · '),
        ]));
    }

    /** Il logo viene incorporato come data URI; un errore dello storage non deve bloccare il PDF. */
    private function logoDataUri(Company $company): ?string
    {
        if (! $company->logo_path) {
            return null;
        }

        try {
            $disk = Storage::disk(self::LOGO_DISK);
            $mime = $disk->mimeType($company->logo_path) ?: 'image/png';

            return "data:{$mime};base64," . base64_encode($disk->get($company->logo_path));
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    private function safeColor(?string $color, string $fallback): string
    {
        return preg_match('/^#[0-9a-fA-F]{6}$/', (string) $color) ? $color : $fallback;
    }
}
