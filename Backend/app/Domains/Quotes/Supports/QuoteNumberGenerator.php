<?php
declare(strict_types=1);

namespace App\Domains\Quotes\Supports;

use App\Domains\Quotes\Models\QuoteSettings;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use LogicException;

final class QuoteNumberGenerator
{
    public function next(
        QuoteSettings $settings,
        ?CarbonInterface $date = null
    ): string {
        if (DB::transactionLevel() === 0) {
            throw new LogicException(
                'QuoteNumberGenerator::next() va chiamato dentro una transazione.'
            );
        }

        $year = ($date ?? CarbonImmutable::now())
            ->setTimezone($settings->timezone)
            ->year;

        if (
            $settings->quote_number_reset_year
            && $settings->quote_number_year !== $year
        ) {
            $settings->next_quote_number = $settings->quote_start_number;
        }

        $sequence = $settings->next_quote_number;

        $settings->next_quote_number = $sequence + 1;
        $settings->quote_number_year = $year;
        $settings->save();

        return $this->format($settings, $year, $sequence);
    }

    public function preview(
        QuoteSettings $settings,
        ?CarbonInterface $date = null
    ): string {
        $year = ($date ?? CarbonImmutable::now())
            ->setTimezone($settings->timezone)
            ->year;

        $sequence = (
            $settings->quote_number_reset_year
            && $settings->quote_number_year !== $year
        )
            ? $settings->quote_start_number
            : $settings->next_quote_number;

        return $this->format($settings, $year, $sequence);
    }

    private function format(
        QuoteSettings $settings,
        int $year,
        int $sequence
    ): string {
        return sprintf(
            '%s-%d-%s',
            $settings->quote_prefix,
            $year,
            str_pad(
                (string) $sequence,
                $settings->quote_number_padding,
                '0',
                STR_PAD_LEFT
            )
        );
    }
}