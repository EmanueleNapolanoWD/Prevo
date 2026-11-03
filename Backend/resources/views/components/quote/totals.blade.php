@props(['totals' => [], 'money'])
@php
    $vatGroups = data_get($totals, 'vat', []);
    $surcharge = (int) data_get($totals, 'surcharge', 0);
    $stamp = (int) data_get($totals, 'stamp_duty', 0);
@endphp
{{-- Importi in centesimi, già calcolati da GenerateQuotePdfAction::buildTotals(): nessun ricalcolo qui --}}
<section class="qd-totals-section">
    <dl class="qd-totals">
        <div>
            <dt>Imponibile</dt>
            <dd>{{ $money(data_get($totals, 'net', 0)) }}</dd>
        </div>
        @if ($surcharge !== 0)
            <div>
                <dt>Maggiorazione</dt>
                <dd>{{ $money($surcharge) }}</dd>
            </div>
        @endif
        {{-- Una riga per aliquota: con una sola aliquota coincide con "IVA (22%)" di QuoteDocument --}}
        @forelse ($vatGroups as $group)
            <div>
                <dt>IVA ({{ $group['rate'] }}%)</dt>
                <dd>{{ $money($group['tax']) }}</dd>
            </div>
        @empty
            <div>
                <dt>IVA</dt>
                <dd>{{ $money(data_get($totals, 'tax', 0)) }}</dd>
            </div>
        @endforelse
        <div class="qd-grand-total">
            <dt>Totale</dt>
            <dd>{{ $money(data_get($totals, 'total', 0)) }}</dd>
        </div>
        {{-- Estensione rispetto a QuoteDocument: il bollo non è incluso in `total` --}}
        @if ($stamp > 0)
            <div>
                <dt>Bollo</dt>
                <dd>{{ $money($stamp) }}</dd>
            </div>
            <div class="qd-payable">
                <dt>Da pagare</dt>
                <dd>{{ $money(data_get($totals, 'payable', 0)) }}</dd>
            </div>
        @endif
    </dl>
</section>
