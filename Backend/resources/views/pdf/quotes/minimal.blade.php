{{-- resources/views/pdf/quotes/minimal.blade.php --}}
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo {{ $quote->number }}</title>
<style>
@include('pdf.quotes.partials.styles')
:root { --quote-primary: {{ $colors['primary'] }}; --quote-accent: {{ $colors['accent'] }}; }

/* ---------- Variante minimal ---------- */
.minimal { font-size: 11px; }

.minimal .header {
  align-items: flex-end;
  padding-bottom: 18px;
  border-bottom-width: 1px;
}
.minimal .companyName {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .12em;
}
.minimal .companyMeta { font-size: 10px; }
.minimal .docMeta h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: .02em;
  color: var(--quote-primary);
}
.minimal .number {
  font-size: 11px;
  letter-spacing: .08em;
  color: var(--quote-accent);
}

.minimal .titleBlock h2 {
  font-size: 14px;
  font-weight: 400;
  color: #111827;
}

.minimal h3 {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .14em;
  color: #9ca3af;
}

.minimal .table th {
  background: transparent;
  color: #9ca3af;
  font-size: 9px;
  font-weight: 600;
  padding: 8px 4px;
  border-bottom: 1px solid #111827;
}
.minimal .table td {
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
}
.minimal .table tbody tr:nth-child(even) { background: transparent; }

.minimal .totals { width: 42%; }
.minimal .totals .grandTotal {
  border-top: 1px solid #111827;
  padding-top: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.minimal .paymentSection {
  background: transparent;
  border-left: 1px solid #9ca3af;
}
.minimal .termsSection strong { color: #111827; }
</style>
</head>
<body>
<div class="document minimal">

  <header class="header">
    <div class="brand">
      @if($logo)
        <img class="logo" src="{{ $logo }}" alt="Logo di {{ $company->name }}">
      @endif
      @include('pdf.quotes.partials.company')
    </div>

    <div class="docMeta">
      <h1>Preventivo</h1>
      <div class="number">N. {{ filled($quote->number) ? $quote->number : '—' }}</div>
    </div>
  </header>

  @include('pdf.quotes.partials.body')

</div>
</body>
</html>