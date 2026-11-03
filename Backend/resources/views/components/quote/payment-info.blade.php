@props(['paymentMethod' => null, 'paymentTerms' => null, 'iban' => null])
@php
    // "IT60X0542811101000000123456" -> "IT60 X054 2811 1010 0000 0123 456"
    $formatIban = static fn (string $iban): string => trim(preg_replace('/(.{4})/', '$1 ', preg_replace('/\s+/', '', $iban)));
@endphp
@if (filled($paymentMethod) || filled($paymentTerms) || filled($iban))
    <section class="qd-payment">
        <strong>Pagamento</strong>
        @if (filled($paymentMethod)) <p>Metodo: {{ $paymentMethod }}</p> @endif
        @if (filled($paymentTerms)) <p>{{ $paymentTerms }}</p> @endif
        @if (filled($iban)) <p class="qd-iban">IBAN {{ $formatIban($iban) }}</p> @endif
    </section>
@endif
