{{--
  PDF del preventivo, generato da QuotePdfService tramite dompdf.
  dompdf non supporta flexbox e grid: ogni layout a più colonne qui è una tabella.
--}}
@php
    use App\Domains\Quotes\Enums\DiscountType;
    use Illuminate\Support\Number;

    $money = fn ($value) => Number::currency((float) $value, $quote->currency ?: 'EUR', 'it');
    $number = fn ($value) => Number::format((float) $value, maxPrecision: 3, locale: 'it');
    $formatIban = fn (string $iban) => trim(chunk_split(preg_replace('/\s+/', '', $iban), 4, ' '));
@endphp
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <title>Preventivo {{ $quote->number }}</title>
    <style>
        @page { margin: 15mm 12mm 18mm 12mm; }

        /* Niente reset universale dei margini: dompdf applica i margini di @page tramite html/body. */
        p { margin: 0; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 9.5pt; line-height: 1.45; color: #111827; }
        table { width: 100%; border-collapse: collapse; }
        td, th { vertical-align: top; text-align: left; }
        .right { text-align: right; }
        .muted { color: #6b7280; }

        /* Intestazione */
        .header { padding-bottom: 12pt; margin-bottom: 16pt; border-bottom: 3px solid {{ $primary }}; }
        .logo { max-width: 140px; max-height: 56px; margin-bottom: 6pt; }
        .company-name { font-size: 11pt; font-weight: bold; color: {{ $primary }}; }
        .company-meta { font-size: 7.5pt; color: #6b7280; }
        .eyebrow { font-size: 7.5pt; font-weight: bold; letter-spacing: 1.5pt; color: {{ $accent }}; }

        /* Titolo */
        .title { font-size: 16pt; line-height: 1.25; font-weight: bold; color: {{ $primary }}; }
        .description { margin-top: 5pt; font-size: 9pt; color: #4b5563; white-space: pre-line; }

        .section { margin-top: 16pt; }
        .section-title { margin-bottom: 4pt; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8pt; color: {{ $accent }}; }

        /* Righe del preventivo */
        .items th { padding: 5pt 7pt; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.5pt; background: {{ $primary }}; color: {{ $quote->text_on_primary }}; }
        .items td { padding: 6pt 7pt; border-bottom: 1px solid #e5e7eb; }
        .items tr { page-break-inside: avoid; }
        .items .num { text-align: right; white-space: nowrap; }
        .item-name { font-weight: bold; }
        .item-desc { font-size: 8.5pt; color: #6b7280; white-space: pre-line; }

        /* Totali */
        .totals { page-break-inside: avoid; }
        .totals td { padding: 4pt 0; border-bottom: 1px solid #e5e7eb; }
        .totals .grand td { padding-top: 7pt; border-bottom: 0; border-top: 2px solid {{ $primary }}; font-size: 11.5pt; font-weight: bold; color: {{ $primary }}; }

        .payment { padding: 8pt 11pt; border-left: 3px solid {{ $accent }}; background: #f9fafb; font-size: 8.5pt; page-break-inside: avoid; }
        .text-block { page-break-inside: avoid; }
        .text-block strong { color: {{ $primary }}; }
        .text-block p { font-size: 8.5pt; color: #4b5563; white-space: pre-line; }

        .footer { position: fixed; bottom: -11mm; left: 0; right: 0; text-align: center; font-size: 7.5pt; color: #9ca3af; }

        /* Varianti di template (classic è lo stile di base) */
        .modern .header { border-bottom: 0; border-left: 6px solid {{ $accent }}; padding-left: 11pt; }
        .minimal .header { border-bottom-width: 1px; }
        .minimal .items th { background: transparent; color: {{ $primary }}; border-bottom: 2px solid {{ $primary }}; }
    </style>
</head>
<body class="{{ $template }}">
    <div class="footer">Documento generato con Prevo</div>

    <div class="header">
        <table>
            <tr>
                <td>
                    @if ($logo)
                        <img src="{{ $logo }}" alt="" class="logo">
                    @endif
                    <div class="company-name">{{ $company->name }}</div>
                    @foreach ($companyLines as $line)
                        <div class="company-meta">{{ $line }}</div>
                    @endforeach
                </td>
                <td class="right" style="width: 40%">
                    <div class="eyebrow">PREVENTIVO</div>
                    <div class="muted">N. {{ $quote->number }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="title">{{ $quote->title }}</div>
    @if (filled($quote->description))
        <div class="description">{{ $quote->description }}</div>
    @endif

    <table class="section">
        <tr>
            <td>
                <div class="section-title">Destinatario</div>
                <strong>{{ $clientName ?: '—' }}</strong>
                @foreach ($clientLines as $line)
                    <div>{{ $line }}</div>
                @endforeach
            </td>
            @if ($validUntil)
                <td class="right" style="width: 35%">
                    <div class="section-title">Valido fino al</div>
                    <strong>{{ $validUntil }}</strong>
                </td>
            @endif
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Dettaglio del preventivo</div>
        <table class="items">
            <thead>
                <tr>
                    <th>Descrizione</th>
                    <th class="num">Qtà</th>
                    <th class="num">Prezzo</th>
                    <th class="num">Sconto</th>
                    <th class="num">Importo</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($quote->items as $item)
                    @php
                        // La prima riga della descrizione è il nome della voce, il resto sono i dettagli.
                        [$name, $details] = array_pad(explode("\n", (string) $item->description, 2), 2, null);
                    @endphp
                    <tr>
                        <td>
                            <div class="item-name">{{ $name }}</div>
                            @if (filled($details))
                                <div class="item-desc">{{ $details }}</div>
                            @endif
                        </td>
                        <td class="num">{{ $number($item->quantity) }} {{ $item->unit }}</td>
                        <td class="num">{{ $money($item->unit_price) }}</td>
                        <td class="num">
                            @if ((float) $item->discount_value <= 0)
                                —
                            @elseif ($item->discount_type === DiscountType::Percentage)
                                {{ $number($item->discount_value) }}%
                            @else
                                {{ $money($item->discount_value) }}
                            @endif
                        </td>
                        {{-- subtotal: importo della riga al netto dello sconto, IVA esclusa --}}
                        <td class="num">{{ $money($item->subtotal) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <table class="section totals">
        <tr>
            <td style="border: 0"></td>
            <td style="width: 75mm; border: 0; padding: 0">
                <table>
                    <tr>
                        <td class="muted">Imponibile</td>
                        <td class="right">{{ $money($quote->taxable_amount) }}</td>
                    </tr>
                    @if ((float) $quote->surcharge != 0)
                        <tr>
                            <td class="muted">di cui maggiorazione</td>
                            <td class="right">{{ $money($quote->surcharge) }}</td>
                        </tr>
                    @endif
                    <tr>
                        <td class="muted">IVA @if ($vatRate !== null)({{ $number($vatRate) }}%)@endif</td>
                        <td class="right">{{ $money($quote->tax_total) }}</td>
                    </tr>
                    <tr class="grand">
                        <td>Totale</td>
                        <td class="right">{{ $money($quote->total) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    @if (filled($settings?->default_payment_method) || filled($settings?->default_payment_terms) || filled($company->iban))
        <div class="section payment">
            <strong>Pagamento</strong>
            @if (filled($settings?->default_payment_method)) <div>Metodo: {{ $settings->default_payment_method }}</div> @endif
            @if (filled($settings?->default_payment_terms)) <div>{{ $settings->default_payment_terms }}</div> @endif
            @if (filled($company->iban)) <div>IBAN {{ $formatIban($company->iban) }}</div> @endif
        </div>
    @endif

    @foreach (['Note' => $quote->notes, 'Condizioni' => $quote->terms] as $label => $text)
        @if (filled($text))
            <div class="section text-block">
                <strong>{{ $label }}</strong>
                <p>{{ $text }}</p>
            </div>
        @endif
    @endforeach
</body>
</html>
