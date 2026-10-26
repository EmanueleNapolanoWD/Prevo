<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo {{ $quote->number }}</title>
<style>
@include('pdf.quotes.partials.base-css')

:root { --primary: {{ $colors['primary'] }}; --accent: {{ $colors['accent'] }}; }

body { font-size: 11px; }
.header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 18px; border-bottom: 1px solid var(--primary); }
.company-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; }
.header .lines { font-size: 10px; margin-top: 4px; }
.doc-title { text-align: right; }
.doc-title h1 { margin: 0; font-size: 30px; font-weight: 300; letter-spacing: .02em; color: var(--primary); }
.doc-title .number { font-size: 11px; color: var(--accent); letter-spacing: .08em; }

.parties { margin-top: 26px; }
.party h4, .block h4 { font-size: 9px; font-weight: 600; color: #9ca3af; letter-spacing: .14em; }
.party-name { font-weight: 600; }
.subject { font-weight: 400; font-size: 14px; }

.items th { font-size: 9px; font-weight: 600; color: #9ca3af; border-bottom: 1px solid #111827; padding: 8px 4px; }
.items td { padding: 10px 4px; border-bottom: 1px solid #f3f4f6; }
.totals { width: 42%; }
.totals .grand td { border-top: 1px solid #111827; padding-top: 10px; font-size: 15px; font-weight: 600; }
.block { margin-top: 26px; }
</style>
</head>
<body>

<div class="header">
  <div>
    @if($logo)<img class="logo" src="{{ $logo }}" alt="">@endif
    <div class="company-name">{{ $company->name }}</div>
    <div class="lines muted">
      @foreach($companyLines as $line)<div>{{ $line }}</div>@endforeach
    </div>
  </div>
  <div class="doc-title">
    <h1>Preventivo</h1>
    <div class="number">N. {{ $quote->number }}</div>
  </div>
</div>

@include('pdf.quotes.partials.parties')
@include('pdf.quotes.partials.items')
@include('pdf.quotes.partials.totals')
@include('pdf.quotes.partials.notes')

</body>
</html>