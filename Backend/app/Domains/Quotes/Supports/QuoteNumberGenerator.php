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
    public function next(QuoteSettings $settings, ?CarbonInterface $date = null): string
    {
        if (DB::transactionLevel() === 0) {
            throw new LogicException('QuoteNumberGenerator::next() va chiamato dentro una transazione.');
        }


        $year = ($now ?? CarbonImmutable::now())->setTimezone($settings->timezone)->year;

        //reset annuale solo se quote_number_reset_year è treu e anno diverso 
        if (
            $settings->quote_number_reset_year !== null
            && $settings->quote_number_year !== $year
        ) {
            $settings->next_quote_number = $settings->quote_start_number;
        }

        $sequence = $settings->next_quote_number;

        $settings->next_quote_number = $sequence + 1;
        $settings->quote_number_year = $year;
        $settings->save();

        return sprintf(
            '%s-%d-%s',
            $settings->quote_prefix,
            $year,
            str_pad((string) $sequence, $settings->quote_number_padding, '0', STR_PAD_LEFT),
        );
    }




}