@if(filled($quote->notes))
  <div class="block">
    <h4>Note</h4>
    <div class="pre">{{ $quote->notes }}</div>
  </div>
@endif

@if(filled($quote->terms))
  <div class="block">
    <h4>Termini e condizioni</h4>
    <div class="pre small">{{ $quote->terms }}</div>
  </div>
@endif