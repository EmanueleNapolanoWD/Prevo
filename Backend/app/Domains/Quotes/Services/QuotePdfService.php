<?php

namespace App\Domains\Quotes\Services;

use App\Domains\Quotes\Models\Quote;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;

class QuotePdfService
{
    public function builder(Quote $quote): PdfBuilder
    {
        return Pdf::html($this->renderHtml($quote))
            ->driver('cloudflare')
            ->format('a4');
    }

    /** Byte del PDF. Cache breve, si invalida a ogni modifica del preventivo. */
    public function content(Quote $quote): string
    {
        $key = "quote-pdf:{$quote->id}:{$quote->updated_at?->timestamp}";

        return base64_decode(Cache::remember(
            $key,
            now()->addMinutes(15),
            fn() => $this->builder($quote)->base64()
        ));
    }

    public function filename(Quote $quote): string
    {
        return "preventivo-{$quote->number}.pdf";
    }

    /** Link pubblico temporaneo per WhatsApp / mail. */
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

    private function renderHtml(Quote $quote): string
    {
        $company = $quote->company;
        $internal = rtrim(config('app.frontend_internal_url'), '/');
        $public = rtrim(config('app.frontend_public_url'), '/');

        $signed = URL::temporarySignedRoute(
            'quotes.print-data',
            now()->addMinutes(2),
            ['company' => $company->slug, 'quoteId' => $quote->id],
            absolute: false,
        );
        parse_str((string) parse_url($signed, PHP_URL_QUERY), $query);

        $url = "{$internal}/print/{$company->slug}/quotes/{$quote->id}";
        $secretConfigured = filled(config('services.print.secret'));

        $start = microtime(true);

        try {
            $response = Http::withHeaders(['X-Print-Secret' => config('services.print.secret')])
                ->timeout(30)
                ->get($url, $query);

            $status = $response->status();
            $elapsedMs = (microtime(true) - $start) * 1000;


            $html = $response->throw()->body();

        } catch (\Illuminate\Http\Client\RequestException $e) {
            $status = $e->response?->status() ?? null;
            $elapsedMs = (microtime(true) - $start) * 1000;

            Log::error('[pdf] errore HTTP pagina di stampa', [
                'quote_id' => $quote->id,
                'company_slug' => $company->slug,
                'url' => $url,
                'status' => $status,
                'elapsed_ms' => round($elapsedMs, 1),
                'has_print_secret_header' => $secretConfigured,
                'message' => $e->getMessage(),
            ]);

            throw new \RuntimeException(
                'Pagina di stampa non raggiungibile (HTTP ' . ($status ?? 'sconosciuto') . ').',
                previous: $e,
            );
        } catch (\Throwable $e) {
            $elapsedMs = (microtime(true) - $start) * 1000;

            Log::error('[pdf] errore imprevisto richiesta pagina di stampa', [
                'quote_id' => $quote->id,
                'company_slug' => $company->slug,
                'url' => $url,
                'elapsed_ms' => round($elapsedMs, 1),
                'has_print_secret_header' => $secretConfigured,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }

        if (str_contains($html, 'name="next-error"') || str_contains($html, 'NEXT_HTTP_ERROR_FALLBACK')) {
            Log::warning('[pdf] risposta pagina di stampa contiene errore Next.js', [
                'quote_id' => $quote->id,
                'company_slug' => $company->slug,
                'url' => $url,
                'bytes' => strlen($html),
            ]);

            throw new \RuntimeException('Pagina di stampa non valida (errore Next.js): controlla PRINT_SECRET e la firma.');
        }


        return $this->prepare($html, $internal, $public);
    }

    private function prepare(string $html, string $internal, string $public): string
    {
        $previous = libxml_use_internal_errors(true);

        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NOWARNING | LIBXML_NOERROR);

        foreach ($dom->childNodes as $node) {            // rimuove il PI xml aggiunto per la codifica
            if ($node->nodeType === XML_PI_NODE) {
                $dom->removeChild($node);
                break;
            }
        }

        $xp = new \DOMXPath($dom);

        // 1. Suspense: porta il contenuto dal blocco nascosto al suo posto
        foreach ($xp->query('//template[starts-with(@id,"B:")]') as $template) {
            $id = 'S:' . substr($template->getAttribute('id'), 2);
            $source = $xp->query("//div[@id='{$id}']")->item(0);

            if (!$source) {
                continue;
            }

            while ($source->firstChild) {
                $template->parentNode->insertBefore($source->firstChild, $template);
            }

            $template->parentNode->removeChild($template);
            $source->parentNode->removeChild($source);
        }

        // 2. CSS inline, scaricato dalla rete interna
        foreach (iterator_to_array($xp->query('//link[@rel="stylesheet"]')) as $link) {
            $href = $link->getAttribute('href');

            if (!str_starts_with($href, '/')) {
                continue;
            }

            $css = Http::timeout(15)->get($internal . $href)->body();
            $css = str_replace(
                ['url(/_next', 'url("/_next', "url('/_next"],
                ["url({$public}/_next", "url(\"{$public}/_next", "url('{$public}/_next"],
                $css
            );

            $style = $dom->createElement('style');
            $style->appendChild($dom->createTextNode($css));
            $link->parentNode->replaceChild($style, $link);
        }

        // 3. Via script e preload: il PDF è HTML statico
        foreach (iterator_to_array($xp->query('//script | //link[@rel="preload" or @rel="prefetch" or @rel="modulepreload"]')) as $node) {
            $node->parentNode->removeChild($node);
        }

        // 4. Asset rimasti relativi (immagini, font) verso l'URL pubblico
        if ($head = $xp->query('//head')->item(0)) {
            $base = $dom->createElement('base');
            $base->setAttribute('href', $public . '/');
            $head->insertBefore($base, $head->firstChild);
        }

        $result = $dom->saveHTML();

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (config('app.debug')) {
            file_put_contents(storage_path('app/debug-quote.html'), $result);   // TEMPORANEO, da togliere
        }

        return $result;
    }
}