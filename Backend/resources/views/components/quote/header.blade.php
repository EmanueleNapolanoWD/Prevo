@props(['company' => null, 'address' => null, 'logo' => null, 'number' => null])
@php
    $vat = data_get($company, 'vat_number');
    $taxCode = data_get($company, 'tax_code');
    $contacts = collect([data_get($company, 'email'), data_get($company, 'phone')])->filter(fn ($v) => filled($v))->implode(' · ');
@endphp
<header class="qd-header">
    <div class="qd-brand">
        {{-- $logo è un data URL costruito dalla action: nessun URL firmato che possa scadere --}}
        @if (filled($logo))
            <img src="{{ $logo }}" alt="Logo di {{ data_get($company, 'name') }}" width="140" height="56" class="qd-logo">
        @endif

        @if (filled($company))
            <div class="qd-company-info">
                <strong class="qd-company-name">{{ data_get($company, 'name') }}</strong>
                <p class="qd-company-meta">{{ $address }}</p>
                @if (filled($vat) || filled($taxCode))
                    <p class="qd-company-meta">@if (filled($vat))P.IVA {{ $vat }}@endif @if (filled($vat) && filled($taxCode)) · @endif @if (filled($taxCode))C.F. {{ $taxCode }}@endif</p>
                @endif
                @if ($contacts !== '')
                    <p class="qd-company-meta">{{ $contacts }}</p>
                @endif
            </div>
        @else
            <strong class="qd-company-name qd-company-muted">La tua azienda</strong>
        @endif
    </div>

    <div class="qd-doc-meta">
        <span class="qd-eyebrow">PREVENTIVO</span>
        <p class="qd-number">N. {{ filled($number) ? $number : '—' }}</p>
    </div>
</header>
