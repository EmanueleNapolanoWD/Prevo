<table class="totals">
  @if($totals['discount'] > 0)
    <tr>
      <td>Totale lordo</td>
      <td class="num">{{ $money($totals['gross']) }}</td>
    </tr>
    <tr>
      <td>Sconti</td>
      <td class="num">− {{ $money($totals['discount']) }}</td>
    </tr>
  @endif

  <tr>
    <td>Imponibile</td>
    <td class="num">{{ $money($totals['net']) }}</td>
  </tr>

  @if($totals['surcharge'] > 0)
    <tr>
      <td>Maggiorazione</td>
      <td class="num">{{ $money($totals['surcharge']) }}</td>
    </tr>
  @endif

  @foreach($totals['vat'] as $row)
    <tr>
      <td>IVA {{ $row['rate'] }}% <span class="muted small">su {{ $money($row['base']) }}</span></td>
      <td class="num">{{ $money($row['tax']) }}</td>
    </tr>
  @endforeach

  @if($totals['stamp_duty'] > 0)
    <tr>
      <td>Imposta di bollo</td>
      <td class="num">{{ $money($totals['stamp_duty']) }}</td>
    </tr>
  @endif

  <tr class="grand">
    <td>Totale</td>
    <td class="num">{{ $money($totals['total']) }}</td>
  </tr>
</table>