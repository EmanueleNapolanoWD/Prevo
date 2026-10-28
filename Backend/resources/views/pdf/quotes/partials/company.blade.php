@php
    $cityLine = trim(collect([
        $company->postal_code ?? null,
        $company->city ?? null,
    ])->filter()->implode(' '));

    $cityLine = trim(collect([
        $cityLine,
        $company->province ? "({$company->province})" : null,
    ])->filter()->implode(' '));

    $address = collect([
        $company->address ?? null,
        $cityLine,
    ])->filter()->implode(', ');

    $companyContacts = collect([
        $company->email ?? null,
        $company->phone ?? null,
    ])->filter()->implode(' · ');
@endphp

<div class="companyInfo">
    <strong class="companyName">{{ $company->name }}</strong>

    @if ($address)
        <p class="companyMeta">{{ $address }}</p>
    @endif

    @if ($company->vat_number || $company->tax_code)
        <p class="companyMeta">
            @if ($company->vat_number)
                P.IVA {{ $company->vat_number }}
            @endif

            @if ($company->tax_code)
                @if ($company->vat_number) · @endif
                C.F. {{ $company->tax_code }}
            @endif
        </p>
    @endif

    @if ($companyContacts)
        <p class="companyMeta">{{ $companyContacts }}</p>
    @endif
</div>