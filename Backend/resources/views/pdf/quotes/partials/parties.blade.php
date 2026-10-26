<div class="parties">
  <div class="party">
    <h4>Destinatario</h4>
    <div class="party-name">{{ $clientName }}</div>
    <div class="lines muted">
      @foreach($clientLines as $line)
        <div>{{ $line }}</div>
      @endforeach
    </div>
  </div>

  <div class="party">
    <h4>Dettagli</h4>
    <table class="meta">
      <tr>
        <td class="muted">Numero</td>
        <td class="num">{{ $quote->number }}</td>
      </tr>
      @if($dates['issued'])
        <tr>
          <td class="muted">Data emissione</td>
          <td class="num">{{ $dates['issued'] }}</td>
        </tr>
      @endif
      @if($dates['valid_until'])
        <tr>
          <td class="muted">Valido fino al</td>
          <td class="num">{{ $dates['valid_until'] }}</td>
        </tr>
      @endif
    </table>
  </div>
</div>

@if(filled($quote->title))
  <h2 class="subject">{{ $quote->title }}</h2>
@endif
@if(filled($quote->description))
  <div class="pre muted">{{ $quote->description }}</div>
@endif