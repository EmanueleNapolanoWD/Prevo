{{-- resources/views/pdf/quotes/classic.blade.php (identico al preview) --}}
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo {{ $quote->number }}</title>
<style>
@include('pdf.quotes.partials.styles')
:root { --quote-primary: {{ $colors['primary'] }}; --quote-accent: {{ $colors['accent'] }}; }
</style>
</head>
<body>
<div class="document classic">

  <header class="header">
    <div class="brand">
      @if($logo)
        <img class="logo" src="{{ $logo }}" alt="Logo di {{ $company->name }}">
      @endif
      @include('pdf.quotes.partials.company')
    </div>

    <div class="docMeta">
      <span class="eyebrow">PREVENTIVO</span>
      <p class="number">N. {{ filled($quote->number) ? $quote->number : '—' }}</p>
    </div>
  </header>

  @include('pdf.quotes.partials.body')

</div>
</body>
</html>