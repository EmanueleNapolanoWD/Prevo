@props(['name' => null, 'lines' => [], 'validUntil' => null])
<section class="qd-meta-grid">
    <div class="qd-client">
        <x-quote.section-title>Destinatario</x-quote.section-title>
        <strong @class(['qd-client-muted' => ! filled($name)])>{{ filled($name) ? $name : 'Seleziona un cliente' }}</strong>
        @foreach ($lines as $line)
            <p>{{ $line }}</p>
        @endforeach
    </div>

    {{-- $validUntil arriva già formattato (d/m/Y) da $dates['valid_until'] --}}
    @if (filled($validUntil))
        <div class="qd-validity">
            <x-quote.section-title>Valido fino al</x-quote.section-title>
            <strong>{{ $validUntil }}</strong>
        </div>
    @endif
</section>
