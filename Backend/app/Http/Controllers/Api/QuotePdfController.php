<?php

namespace App\Http\Controllers\Api;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Actions\BuildQuotePrintDataAction;
use App\Domains\Quotes\Models\Quote;
use App\Domains\Quotes\Services\QuotePdfService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class QuotePdfController extends Controller
{
    public function __construct(private QuotePdfService $pdf)
    {
    }

    // Autenticato: visualizza il PDF
    public function show(Company $company, string $quoteId): Response
    {
        return $this->respond($this->findQuote($company, $quoteId, true), 'inline');
    }

    // Autenticato: scarica il PDF
    public function download(Company $company, string $quoteId): Response
    {
        return $this->respond($this->findQuote($company, $quoteId, true), 'attachment');
    }

    // Link firmato pubblico (WhatsApp / mail)
    public function publicShow(Company $company, string $quoteId): Response
    {
        return $this->respond($this->findQuote($company, $quoteId), 'inline');
    }

    // Firmato, chiamato dalla pagina di stampa Next: restituisce i DATI (JSON), non il PDF
    public function printData(Company $company, string $quoteId, BuildQuotePrintDataAction $action): JsonResponse
    {
        return response()
            ->json($action->execute($company, $quoteId))
            ->header('Cache-Control', 'no-store');
    }

    private function findQuote(Company $company, string $quoteId, bool $authorize = false): Quote
    {
        $quote = Quote::query()
            ->where('company_id', $company->id)
            ->findOrFail($quoteId);

        if ($authorize) {
            $this->authorize('view', $quote);   
        }

        return $quote;
    }

    private function respond(Quote $quote, string $disposition): Response
    {
        try {
            $content = $this->pdf->content($quote);
        } catch (RuntimeException $e) {
            Log::warning('[pdf] errore generazione PDF', [
                'quote_id' => $quote->id,
                'company_id' => $quote->company_id,
                'message' => $e->getMessage(),
            ]);

            return response($e->getMessage(), 502, [
                'Content-Type' => 'text/plain; charset=utf-8',
                'Cache-Control' => 'private, no-store',
            ]);
        } catch (\Throwable $e) {
            Log::error('[pdf] errore imprevisto generazione PDF', [
                'quote_id' => $quote->id,
                'company_id' => $quote->company_id,
                'message' => $e->getMessage(),
            ]);

            return response('Impossibile generare il PDF. Riprova più tardi.', 500, [
                'Content-Type' => 'text/plain; charset=utf-8',
                'Cache-Control' => 'private, no-store',
            ]);
        }

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "{$disposition}; filename=\"{$this->pdf->filename($quote)}\"",
            'Cache-Control' => 'private, no-store',
        ]);
    }
}