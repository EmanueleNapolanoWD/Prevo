@props(['items' => [], 'money', 'qty', 'discountLabel'])
<section class="qd-items-section">
    <x-quote.section-title>Dettaglio del preventivo</x-quote.section-title>

    @if (collect($items)->isEmpty())
        <p class="qd-placeholder">Le voci aggiunte al preventivo appariranno qui.</p>
    @else
        <table class="qd-table">
            <thead>
                <tr>
                    <th>Descrizione</th>
                    <th class="qd-num">Qtà</th>
                    <th class="qd-num">Prezzo</th>
                    <th class="qd-num">Sconto</th>
                    <th class="qd-num">Importo</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td>
                            <span class="qd-item-name">{{ $item->name }}</span>
                            @if (filled($item->description))
                                <span class="qd-item-desc">{{ $item->description }}</span>
                            @endif
                        </td>
                        <td class="qd-num">{{ $qty($item->quantity) }} {{ $item->unit }}</td>
                        <td class="qd-num">{{ $money($item->unit_price) }}</td>
                        <td class="qd-num">{{ $discountLabel($item) }}</td>
                        {{-- subtotal = riga al netto dello sconto, senza IVA (centesimi) --}}
                        <td class="qd-num">{{ $money($item->subtotal) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</section>
