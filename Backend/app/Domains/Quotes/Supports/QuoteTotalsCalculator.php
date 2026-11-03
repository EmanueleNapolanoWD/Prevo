<?php

namespace App\Domains\Quotes\Supports;

use App\Domains\Quotes\Data\CalculatedLine;
use App\Domains\Quotes\Data\QuoteItemData;
use App\Domains\Quotes\Data\QuoteTotals;
use App\Domains\Quotes\Enums\DiscountType;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

final class QuoteTotalsCalculator
{
    /**
     * Tutti gli importi interni e restituiti sono in centesimi (int).
     * Gli unici valori non in centesimi in ingresso sono gli sconti "Fixed" (euro, float),
     * convertiti una sola volta in toCents().
     *
     * Assunzioni:
     *  - la maggiorazione è un importo fisso in centesimi, soggetto a IVA con l'aliquota di default,
     *    e segue la stessa base dei prezzi (IVA inclusa se $pricesIncludesVat);
     *  - lo sconto globale è ripartito sulle righe in proporzione al loro valore (metodo del
     *    resto maggiore): la somma delle quote è esattamente lo sconto, e le righe restituite
     *    lo riflettono;
     *  - IVA e imponibile sono calcolati UNA volta per aliquota sull'importo complessivo del gruppo
     *    (prassi fiscale); gli importi di riga sono poi riconciliati sui totali di gruppo
     *    (l'ultima riga del gruppo assorbe i centesimi di differenza), quindi
     *    sum(righe) + maggiorazione coincide sempre con i totali;
     *  - invariante: total = taxableAmount + taxTotal, in entrambe le modalità;
     *  - con IVA inclusa total coincide con la somma dei prezzi visti dal cliente.
     */
    public function calculate(
        array $items,
        int $surchargeCents,
        float $defaultVatRate,
        bool $pricesIncludesVat = false,
        ?DiscountType $globalDiscountType = null,
        float $globalDiscountValue = 0,
    ): QuoteTotals {
        if ($items === []) {
            throw new InvalidArgumentException('Un preventivo deve avere almeno una riga');
        }

        if ($surchargeCents < 0) {
            throw new InvalidArgumentException('La maggiorazione non può essere negativa');
        }

        // 1) Valore di ogni riga (nella base dei prezzi: netto oppure IVA inclusa), dopo sconto di riga.
        $rows = [];
        foreach (array_values($items) as $item) {
            $gross = (int) round($item->quantity * $item->unitPriceCents);
            $value = $gross - $this->lineDiscount($item, $gross);

            $rows[] = [
                'item' => $item,
                'rate' => (float) ($item->vatRate ?? $defaultVatRate),
                'gross' => $gross,
                'value' => $value,
            ];
        }

        // 2) Sconto globale ripartito sulle righe (così le righe restituite lo includono).
        $linesValue = array_sum(array_column($rows, 'value'));
        $globalDiscount = $this->globalDiscount($globalDiscountType, $globalDiscountValue, $linesValue);

        if ($globalDiscount > 0) {
            $shares = $this->allocate($globalDiscount, array_column($rows, 'value'));
            foreach ($rows as $i => $row) {
                $rows[$i]['value'] -= $shares[$i];
            }
        }

        // 3) Raggruppamento per aliquota; la maggiorazione entra nel gruppo con aliquota di default.
        $groups = [];
        foreach ($rows as $i => $row) {
            $key = $this->rateKey($row['rate']);
            $groups[$key] ??= $this->emptyGroup($row['rate']);
            $groups[$key]['rows'][] = $i;
            $groups[$key]['gross'] += $row['gross'];
            $groups[$key]['value'] += $row['value'];
        }

        if ($surchargeCents > 0) {
            $key = $this->rateKey($defaultVatRate);
            $groups[$key] ??= $this->emptyGroup($defaultVatRate);
            $groups[$key]['surcharge'] = $surchargeCents;
            $groups[$key]['value'] += $surchargeCents;
        }

        // 4) Totali per gruppo (un solo arrotondamento per gruppo) + riconciliazione delle righe.
        $taxable = 0;
        $taxTotal = 0;
        $surchargeNet = 0;
        $discountTotal = 0;

        $lineNet = [];
        $lineTax = [];
        $lineTotal = [];

        foreach ($groups as $group) {
            $rate = $group['rate'];

            $groupNet = $this->toNet($group['value'], $rate, $pricesIncludesVat);
            $groupTax = $pricesIncludesVat
                ? $group['value'] - $groupNet
                : (int) round($groupNet * $rate / 100);

            $groupSurchargeNet = $this->toNet($group['surcharge'], $rate, $pricesIncludesVat);
            $groupSurchargeTax = $pricesIncludesVat
                ? $group['surcharge'] - $groupSurchargeNet
                : (int) round($group['surcharge'] * $rate / 100);

            // Sconti totali del gruppo (riga + globale), nella base dei prezzi → netto.
            $groupDiscount = $group['gross'] - ($group['value'] - $group['surcharge']);
            $discountTotal += $this->toNet($groupDiscount, $rate, $pricesIncludesVat);

            $taxable += $groupNet;
            $taxTotal += $groupTax;
            $surchargeNet += $groupSurchargeNet;

            // Quote di riga: ciò che resta del gruppo dopo la maggiorazione.
            $netTarget = $groupNet - $groupSurchargeNet;
            $taxTarget = $groupTax - $groupSurchargeTax;

            $netSum = 0;
            $taxSum = 0;
            foreach ($group['rows'] as $i) {
                $value = $rows[$i]['value'];

                if ($pricesIncludesVat) {
                    $lineTotal[$i] = $value;
                    $lineNet[$i] = $this->toNet($value, $rate, true);
                    $lineTax[$i] = $value - $lineNet[$i];
                } else {
                    $lineNet[$i] = $value;
                    $lineTax[$i] = (int) round($value * $rate / 100);
                    $lineTotal[$i] = $lineNet[$i] + $lineTax[$i];
                }

                $netSum += $lineNet[$i];
                $taxSum += $lineTax[$i];
            }

            // L'ultima riga del gruppo assorbe la differenza di arrotondamento.
            if ($group['rows'] !== []) {
                $last = end($group['rows']);

                if ($pricesIncludesVat) {
                    $lineNet[$last] += $netTarget - $netSum;
                    $lineTax[$last] = $lineTotal[$last] - $lineNet[$last];
                } else {
                    $lineTax[$last] += $taxTarget - $taxSum;
                    $lineTotal[$last] = $lineNet[$last] + $lineTax[$last];
                }
            }
        }

        // Il subtotale è ricavato in modo che: subtotal - discountTotal + surcharge = taxableAmount.
        $subtotal = $taxable - $surchargeNet + $discountTotal;
        $total = $taxable + $taxTotal;

        $lines = [];
        foreach ($rows as $i => $row) {
            /** @var QuoteItemData $item */
            $item = $row['item'];

            $lines[] = new CalculatedLine(
                sortOrder: $i,
                productId: $item->productId,
                description: $item->description,
                unit: $item->unit,
                quantity: $item->quantity,
                unitPriceCents: $item->unitPriceCents,
                discountType: $item->discountType,
                discountValue: $item->discountValue,
                vatRate: $row['rate'],
                subtotalCents: $lineNet[$i],
                taxCents: $lineTax[$i],
                totalCents: $lineTotal[$i],
            );
        }

        $res = new QuoteTotals(
            lines: $lines,
            subtotal: $subtotal,
            discountTotal: $discountTotal,
            surcharge: $surchargeNet,
            taxableAmount: $taxable,
            taxTotal: $taxTotal,
            total: $total,
        );

        Log::debug('QuoteTotalsCalculator: risultato del calcolo', [
            'subtotal' => $res->subtotal,
            'discountTotal' => $res->discountTotal,
            'surcharge' => $res->surcharge,
            'taxableAmount' => $res->taxableAmount,
            'taxTotal' => $res->taxTotal,
            'total' => $res->total,
            'lines_count' => count($res->lines),
        ]);

        return $res;
    }

    private function lineDiscount(QuoteItemData $item, int $lineGross): int
    {
        if ($item->discountType === null || $item->discountValue <= 0) {
            return 0;
        }

        $discount = match ($item->discountType) {
            DiscountType::Percentage => (int) round($lineGross * $item->discountValue / 100),
            DiscountType::Fixed => $this->toCents($item->discountValue),
        };

        return min($discount, $lineGross);
    }

    private function globalDiscount(?DiscountType $type, float $value, int $base): int
    {
        if ($type === null || $value <= 0 || $base <= 0) {
            return 0;
        }

        $discount = match ($type) {
            DiscountType::Percentage => (int) round($base * $value / 100),
            DiscountType::Fixed => $this->toCents($value),
        };

        return min($discount, $base);
    }

    /**
     * Ripartisce $total in parti intere proporzionali ai $weights (metodo del resto maggiore).
     * La somma delle parti è esattamente $total.
     *
     * @param  int[]  $weights
     * @return int[]  stesse chiavi di $weights
     */
    private function allocate(int $total, array $weights): array
    {
        $sum = array_sum($weights);
        if ($total <= 0 || $sum <= 0) {
            return array_fill_keys(array_keys($weights), 0);
        }

        $shares = [];
        $remainders = [];
        $assigned = 0;

        foreach ($weights as $key => $weight) {
            $product = $total * $weight;
            $shares[$key] = intdiv($product, $sum);
            $remainders[$key] = $product % $sum;
            $assigned += $shares[$key];
        }

        arsort($remainders); // resto maggiore per primo (a parità, ordine originale)
        $left = $total - $assigned;

        foreach (array_keys($remainders) as $key) {
            if ($left <= 0) {
                break;
            }
            $shares[$key]++;
            $left--;
        }

        return $shares;
    }

    /** Converte un importo nella base dei prezzi in imponibile (scorporo se IVA inclusa). */
    private function toNet(int $amount, float $rate, bool $pricesIncludeVat): int
    {
        return $pricesIncludeVat
            ? (int) round($amount / (1 + $rate / 100))
            : $amount;
    }

    private function toCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function emptyGroup(float $rate): array
    {
        return ['rate' => $rate, 'gross' => 0, 'value' => 0, 'surcharge' => 0, 'rows' => []];
    }

    private function rateKey(float $rate): string
    {
        return number_format($rate, 2, '.', '');
    }
}