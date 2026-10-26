<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo {{ $quote->number }}</title>
<style>
@include('pdf.quotes.partials.base-css')

:root { --primary: {{ $colors['primary'] }}; --accent: {{ $colors['accent'] }}; }

.band { display: flex; justify-content: space-between; align-items: center; background: var(--primary); color: #fff; padding: 22px 26px; border-radius: 10px; }
.band .company-name { font-size: 17px; font-weight: 700; }
.band .lines { color: rgba(255,255,255,.8); font-size: 10.5px; margin-top: 2px; }
.band h1 { margin: 0 0 6px; font-size: 28px; font-weight: 700; text-align: right; }
.band .pill { display: inline-block; background: var(--accent); color: #fff; font-weight: 700; padding: 3px 12px; border-radius: 999px; font-size: 12px; float: right; }
.logo-box { background: #fff; border-radius: 8px; padding: 8px 10px; display: inline-block; margin-bottom: 10px; }
.logo-box .logo { margin: 0; }

.party { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
.party h4, .block h4 { color: var(--accent); }
.subject { color: var(--primary); }

.items th { color: var(--primary); border-bottom: 2px solid var(--primary); }
.items td { border-bottom: 1px solid #eef0f3; }
.totals .grand td { background: var(--primary); color: #fff; padding: 10px 12px; }
.totals .grand td:first-child { border-radius: 8px 0 0 8px; }
.totals .grand td:last-child { border-radius: 0 8px 8px 0; }
.totals td:first-child { padding-left: 4px; }
</style>
</head>
<body>

<div class="band">
  <div>
    @if($logo)<div class="logo-box"><img class="logo" src="{{ $logo }}" alt=""></div>@endif
    <div class="company-name">{{ $company->name }}</div>
    <div class="lines">
      @foreach($companyLines as $line)<div>{{ $line }}</div>@endforeach
    </div>
  </div>
  <div>
    <h1>Preventivo</h1>
    <span class="pill">{{ $quote->number }}</span>
  </div>
</div>

@include('pdf.quotes.partials.parties')
@include('pdf.quotes.partials.items')
@include('pdf.quotes.partials.totals')
@include('pdf.quotes.partials.notes')

</body>
</html>