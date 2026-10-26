<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo {{ $quote->number }}</title>
<style>
@include('pdf.quotes.partials.base')

:root { --primary: {{ $colors['primary'] }}; --accent: {{ $colors['accent'] }}; }

.header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 3px solid var(--primary); }
.company-name { font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 2px; }
.doc-title { text-align: right; }
.doc-title h1 { margin: 0; font-size: 26px; letter-spacing: .04em; text-transform: uppercase; color: var(--primary); }
.doc-title .number { font-size: 13px; font-weight: 700; color: var(--accent); }

.party h4, .block h4 { color: var(--primary); }
.items th { background: var(--primary); color: #fff; }
.items td { border-bottom: 1px solid #e5e7eb; }
.totals .grand td { border-top: 2px solid var(--primary); color: var(--primary); padding-top: 8px; }
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
    <div class="number">{{ $quote->number }}</div>
  </div>
</div>

@include('pdf.quotes.partials.parties')
@include('pdf.quotes.partials.items')
@include('pdf.quotes.partials.totals')
@include('pdf.quotes.partials.notes')

</body>
</html>