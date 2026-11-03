@props([
    'template' => 'classic',
    'colors' => [],
    'logo' => null,
    'company' => null,
    'companyAddress' => null,
    'number' => null,
    'title' => null,
    'description' => null,
    'clientName' => null,
    'clientLines' => [],
    'validUntil' => null,
    'items' => [],
    'totals' => [],
    'settings' => null,
    'notes' => null,
    'terms' => null,
    'money',
    'qty',
    'discountLabel',
])
@php
    // Solo i tre template supportati (classic non ha regole proprie, come in React).
    $template = in_array($template, ['classic', 'modern', 'minimal'], true) ? $template : 'classic';

    // I colori finiscono in un attributo style: accettiamo solo hex (la action li ha già validati).
    $color = static fn ($value) => is_string($value) && preg_match('/^#[0-9a-fA-F]{3,8}$/', $value) ? $value : null;
    $styleVars = collect([
        '--quote-primary' => $color(data_get($colors, 'primary')),
        '--quote-accent' => $color(data_get($colors, 'accent')),
    ])->filter()->map(fn ($value, $name) => "{$name}: {$value}")->implode('; ');
@endphp
<div class="qd" data-template="{{ $template }}" @if ($styleVars !== '') style="{{ $styleVars }}" @endif>
    <x-quote.header :company="$company" :address="$companyAddress" :logo="$logo" :number="$number" />

    <x-quote.title-block :title="$title" :description="$description" />

    <x-quote.recipient :name="$clientName" :lines="$clientLines" :valid-until="$validUntil" />

    <x-quote.items-table :items="$items" :money="$money" :qty="$qty" :discount-label="$discountLabel" />

    <x-quote.totals :totals="$totals" :money="$money" />

    <x-quote.payment-info
        :payment-method="data_get($settings, 'default_payment_method')"
        :payment-terms="data_get($settings, 'default_payment_terms')"
        :iban="data_get($company, 'iban')"
    />

    @if (filled($notes))
        <x-quote.text-section title="Note" :text="$notes" />
    @endif

    @if (filled($terms))
        <x-quote.text-section title="Condizioni" :text="$terms" />
    @endif

    <footer class="qd-footer">Documento generato con Prevo</footer>
</div>
