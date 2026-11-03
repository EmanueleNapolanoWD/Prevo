{{--
  Vista unica del preventivo per GenerateQuotePdfAction (sostituisce pdf.quotes.classic / modern / minimal).
  Equivalente Blade di QuoteDocument.tsx: il template si sceglie con data-template, non con tre view.

  Variabili fornite dalla action:
    $template        classic | modern | minimal
    $quote           number, title, description, notes, terms          (nomi colonna da verificare)
    $company         name, vat_number, tax_code, email, phone, iban
    $companyAddress  indirizzo già composto (GenerateQuotePdfAction::companyAddress)
    $settings        default_payment_method, default_payment_terms
    $items           righe ordinate: name, description, quantity, unit, unit_price, subtotal (centesimi)
    $totals          buildTotals(): net, surcharge, vat[], tax, total, stamp_duty, payable (centesimi)
    $colors          primary, accent (hex già validati)
    $logo            data URL oppure null
    $clientName, $clientLines, $dates['valid_until']
    $money (centesimi), $qty, $discountLabel   closure di formattazione
--}}
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <title>Preventivo {{ $quote->number }}</title>
    <x-quote.styles />
    <style>
        /* I margini di pagina li gestisce Spatie (->margins()): il "foglio" non ha padding proprio,
           così anche le pagine successive alla prima hanno i margini corretti. */
        .qd { padding: 0; max-width: none; }
    </style>
</head>
<body>
    <x-quote.document
        :template="$template"
        :colors="$colors"
        :logo="$logo"
        :company="$company"
        :company-address="$companyAddress"
        :number="$quote->number"
        :title="$quote->title"
        :description="$quote->description"
        :client-name="$clientName"
        :client-lines="$clientLines"
        :valid-until="$dates['valid_until']"
        :items="$items"
        :totals="$totals"
        :settings="$settings"
        :notes="$quote->notes"
        :terms="$quote->terms"
        :money="$money"
        :qty="$qty"
        :discount-label="$discountLabel"
    />
</body>
</html>
