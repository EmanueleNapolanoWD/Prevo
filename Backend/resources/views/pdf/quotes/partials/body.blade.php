{{--
  resources/views/pdf/quotes/partials/body.blade.php

  Variabili attese dalla view:
    $quote      number, title, description, valid_until, vat_rate, surcharge, notes, terms
    $company    iban (+ campi usati da partials.company)
    $settings   default_payment_method, default_payment_terms (nullable)
    $client     display_name
    $contact    ['address' => ?, 'email' => ?, 'phone' => ?]
    $items      name, description, quantity, unit, unit_price, discount_type, discount_value, subtotal (= calcLineTotal)
    $totals     ['subtotal', 'vat', 'total']
    $money, $qty  closure di formattazione (formato it-IT del front-end)
--}}
@php
    $settings = $settings ?? null;
@endphp
@php
    $iban = $company->iban ? trim(chunk_split(preg_replace('/\s+/', '', $company->iban), 4, ' ')) : null;

    $vatRate = rtrim(rtrim(number_format((float) $quote->vat_rate, 2, ',', '.'), '0'), ',');
    $surcharge = (float) ($quote->surcharge ?? 0);

    $hasPayment = $settings?->default_payment_method || $settings?->default_payment_terms || $company->iban;
@endphp

{{-- Titolo e descrizione --}}
<section class="titleBlock">
    <h2>{{ $quote->title }}</h2>
    @if (filled($quote->description))
        <p class="description">{{ $quote->description }}</p>
    @endif
</section>

{{-- Destinatario + validità --}}
<section class="metaGrid">
    <div class="clientSection">
        <h3>Destinatario</h3>
        <strong>{{ $clientName }}</strong>
        @if (!empty($contact['address']))
            <p>{{ $contact['address'] }}</p>
        @endif
        @if (!empty($contact['email']))
            <p>{{ $contact['email'] }}</p>
        @endif
        @if (!empty($contact['phone']))
            <p>{{ $contact['phone'] }}</p>
        @endif
    </div>

    @if ($quote->valid_until)
        <div class="validity">
            <h3>Valido fino al</h3>
            <strong>{{ \Illuminate\Support\Carbon::parse($quote->valid_until)->format('j/n/Y') }}</strong>
        </div>
    @endif
</section>

{{-- Voci --}}
<section class="itemsSection">
    <h3>Dettaglio del preventivo</h3>

    <table class="table">
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
            @foreach ($items as $item)
                <tr>
                    <td>
                        <span class="itemName">{{ $item->name }}</span>
                        @if (filled($item->description))
                            <span class="itemDesc">{{ $item->description }}</span>
                        @endif
                    </td>
                    <td class="num">{{ $qty($item->quantity) }} {{ $item->unit }}</td>
                    <td class="num">{{ $money($item->unit_price) }}</td>
                    <td class="num">
                        @if ((float) $item->discount_value > 0)
                            {{ $item->discount_type === 'percentage' ? (float) $item->discount_value . '%' : $money($item->discount_value) }}
                        @else
                            —
                        @endif
                    </td>
                    <td class="num">{{ $money($item->subtotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</section>

{{-- Totali --}}
<section class="totalsSection">
    <dl class="totals">
        <div>
            <dt>Imponibile</dt>
            <dd>{{ $money($totals['net']) }}</dd>
        </div>

        @if (($totals['discount'] ?? 0) > 0)
            <div>
                <dt>Sconti</dt>
                <dd>-{{ $money($totals['discount']) }}</dd>
            </div>
        @endif

        @foreach ($totals['vat'] ?? [] as $vat)
            <div>
                <dt>IVA {{ $vat['rate'] }}%</dt>
                <dd>{{ $money($vat['tax']) }}</dd>
            </div>
        @endforeach

        @if (($totals['surcharge'] ?? 0) > 0)
            <div>
                <dt>Maggiorazione</dt>
                <dd>{{ $money($totals['surcharge']) }}</dd>
            </div>
        @endif

        @if (($totals['stamp_duty'] ?? 0) > 0)
            <div>
                <dt>Imposta di bollo</dt>
                <dd>{{ $money($totals['stamp_duty']) }}</dd>
            </div>
        @endif

        <div class="grandTotal">
            <dt>Totale</dt>
            <dd>{{ $money($totals['total']) }}</dd>
        </div>
    </dl>
</section>

{{-- Pagamento --}}
@if ($hasPayment)
    <section class="paymentSection">
        <strong>Pagamento</strong>
        @if ($settings?->default_payment_method)
            <p>Metodo: {{ $settings->default_payment_method }}</p>
        @endif
        @if ($settings?->default_payment_terms)
            <p>{{ $settings->default_payment_terms }}</p>
        @endif
        @if ($iban)
            <p class="iban">IBAN {{ $iban }}</p>
        @endif
    </section>
@endif

{{-- Note e condizioni --}}
@if (filled($quote->notes))
    <section class="termsSection">
        <strong>Note</strong>
        <p>{{ $quote->notes }}</p>
    </section>
@endif

@if (filled($quote->terms))
    <section class="termsSection">
        <strong>Condizioni</strong>
        <p>{{ $quote->terms }}</p>
    </section>
@endif

<footer class="footer">Documento generato con Prevo</footer>
