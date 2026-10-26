<?php

namespace App\Domains\Quotes\Supports;

use App\Domains\Quotes\Data\CalculatedLine;
use App\Domains\Quotes\Data\QuoteItemData;
use App\Domains\Quotes\Data\QuoteTotals;
use App\Domains\Quotes\Enums\DiscountType;
use InvalidArgumentException;

final class QuoteTotalsCalculator
{

    /**
     * Assunzioni:
     *  - la maggiorazione è un importo fisso, soggetto a IVA con l'aliquota di default, e segue
     *    la stessa base dei prezzi (IVA inclusa se $pricesIncludeVat);
     *  - l'IVA totale è calcolata per aliquota sull'importo complessivo (prassi fiscale): la somma
     *    dei tax_amount di riga può differire di qualche centesimo da tax_total;
     *  - con $pricesIncludeVat gli importi di riga/sconto sono IVA inclusa: l'imponibile si ottiene
     *    per scorporo e total coincide con ciò che il cliente vede sui prezzi. In questa modalità
     *    subtotal - discountTotal + surcharge può differire di pochi centesimi da taxableAmount.
     *
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

        $lines = [];
        $subtotal = 0;
        $discountTotal = 0;
        $amountByRate = [];

        foreach (array_values($items) as $position => $item) {
            $lineGross = (int) round($item->quantity * $item->unitPriceCents);
            $discount = $this->discount($item, $lineGross);
            $lineValue = $lineGross - $discount;

            $rate = $item->vatRate ?? $defaultVatRate;
            $divisor = 1 + $rate / 100;

            if ($pricesIncludesVat) {
                $net = (int) round($lineValue / $divisor);
                $tax = $lineValue - $net;
                $lineTotal = $lineValue;
                $grossNet = (int) round($lineGross / $divisor);
                $discountNet = $grossNet - $net;
            } else {
                $net = $lineValue;
                $tax = (int) round($net * $rate / 100);
                $lineTotal = $net + $tax;
                $grossNet = $lineGross;
                $discountNet = $discount;
            }

            $subtotal += $grossNet;
            $discountTotal += $discountNet;

            $key = $this->rateKey($rate);
            $amountByRate[$key] = ($amountByRate[$key] ?? 0) + $lineValue;

            $lines[] = new CalculatedLine(
                sortOrder: $position,
                productId: $item->productId,
                description: $item->description,
                unit: $item->unit,
                quantity: $item->quantity,
                unitPriceCents: $item->unitPriceCents,
                discountType: $item->discountType,
                discountValue: $item->discountValue,
                vatRate: $rate,
                subtotalCents: $net,
                taxCents: $tax,
                totalCents: $lineTotal,
            );
        }

        $linesValue = array_sum($amountByRate);
        $globalDiscount = $this->globalDiscount($globalDiscountType, $globalDiscountValue, $linesValue);

        if ($globalDiscount > 0 && $linesValue > 0) {
            $remaining = $globalDiscount;
            $lastKey = array_key_last($amountByRate);
            $globalDiscountNet = 0;

            foreach ($amountByRate as $key => $amount) {
                $share = $key === $lastKey
                    ? $remaining
                    : (int) round($globalDiscount * $amount / $linesValue);
                $share = min($share, $amount);

                $amountByRate[$key] -= $share;
                $remaining -= $share;

                $globalDiscountNet += $pricesIncludesVat
                    ? (int) round($share / (1 + (float) $key / 100))
                    : $share;
            }

            $discountTotal += $globalDiscountNet;
        }

        $surchargeNet = $surchargeCents;
        if ($surchargeCents > 0) {
            $key = $this->rateKey($defaultVatRate);
            $amountByRate[$key] = ($amountByRate[$key] ?? 0) + $surchargeCents;

            if ($pricesIncludesVat) {
                $surchargeNet = (int) round($surchargeCents / (1 + $defaultVatRate / 100));
            }
        }

        $taxTotal = 0;
        $groupsTotal = 0;
        foreach ($amountByRate as $rate => $amount) {
            $r = (float) $rate;

            if ($pricesIncludesVat) {
                $taxTotal += $amount - (int) round($amount / (1 + $r / 100));
                $groupsTotal += $amount;
            } else {
                $taxTotal += (int) round($amount * $r / 100);
            }
        }

        if ($pricesIncludesVat) {
            $total = $groupsTotal;
            $taxable = $total - $taxTotal;
        } else {
            $taxable = $subtotal - $discountTotal + $surchargeNet;
            $total = $taxable + $taxTotal;
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

        \Log::info('QuoteTotalsCalculator: risultato del calcolo', [
            'subtotal' => $res->subtotal,
            'discountTotal' => $res->discountTotal,
            'surcharge' => $res->surcharge,
            'taxableAmount' => $res->taxableAmount,
            'taxTotal' => $res->taxTotal,
            'total' => $res->total,
            'lines' => $res->lines,
        ]);

        return $res;
    }

    private function discount(QuoteItemData $item, int $lineGross): int
    {
        if ($item->discountType === null || $item->discountValue <= 0) {
            return 0;
        }

        $discount = match ($item->discountType) {
            DiscountType::Percentage => (int) round($lineGross * $item->discountValue / 100),
            DiscountType::Fixed => Money::toCents($item->discountValue),
        };

        return min($discount, $lineGross);
    }

    private function rateKey(float $rate): string
    {
        return number_format($rate, 2, '.', '');
    }

    private function globalDiscount(?DiscountType $type, float $value, int $base): int
    {
        if ($type === null || $value <= 0 || $base <= 0) {
            return 0;
        }

        $discount = match ($type) {
            DiscountType::Percentage => (int) round($base * $value / 100),
            DiscountType::Fixed => Money::toCents($value),
        };

        return min($discount, $base);
    }
}