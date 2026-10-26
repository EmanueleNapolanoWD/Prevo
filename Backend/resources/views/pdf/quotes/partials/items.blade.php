<table class="items">
  <thead>
    <tr>
      <th>Descrizione</th>
      <th class="num">Qtà</th>
      <th class="num">Prezzo</th>
      @if($totals['has_discounts'])
        <th class="num">Sconto</th>
      @endif
      <th class="num">IVA</th>
      <th class="num">Importo</th>
    </tr>
  </thead>
  <tbody>
    @foreach($items as $item)
      <tr>
        <td>
          @if(!empty($item->name))
            <div class="desc-name">{{ $item->name }}</div>
            @if(filled($item->description))
              <div class="desc-text sub">{{ $item->description }}</div>
            @endif
          @else
            <div class="desc-text">{{ $item->description }}</div>
          @endif
        </td>
        <td class="num">{{ $qty($item->quantity) }}@if(!empty($item->unit)) {{ $item->unit }}@endif</td>
        <td class="num">{{ $money($item->unit_price) }}</td>
        @if($totals['has_discounts'])
          <td class="num">{{ $discountLabel($item) }}</td>
        @endif
        <td class="num">{{ rtrim(rtrim(number_format((float) $item->vat_rate, 2, ',', '.'), '0'), ',') }}%</td>
        <td class="num">{{ $money($item->subtotal) }}</td>
      </tr>
    @endforeach
  </tbody>
</table>