<?php

namespace App\Domains\Quotes\Jobs;

use App\Domains\Quotes\Actions\GenerateQuotePdfAction;
use App\Domains\Quotes\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Throwable;

class GenerateQuotePdfJob implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue;

    public int $tries = 5;
    public int $timeout = 90;
    public int $maxExceptions = 3;

    public function __construct(
        public string $quoteId,
        public int $version
    ) {
    }

    public function retryUntil(): \DateTimeInterface
    {
        return now()->addMinutes(30);
    }

    public function backoff(): array
    {
        return [10, 30, 90, 180];
    }

    public function middleware(): array
    {
        return [
            new RateLimited('claudflare-pdf'),
            (new WithoutOverlapping($this->quoteId))
                ->releaseAfter(15)
                ->expireAfter(120)
        ];
    }

    public function handle(GenerateQuotePdfAction $action): void
    {

        $quote = Quote::with(['items', 'company.quoteSettings'])->find($this->quoteId);

        if (!$quote) {
            return;
        }

        //versione superate
        if ($quote->version !== $this->version) {
            return;
        }
        $action->execute($quote);
    }

    public function failed(Throwable $e): void
    {
        report($e);
    }
}