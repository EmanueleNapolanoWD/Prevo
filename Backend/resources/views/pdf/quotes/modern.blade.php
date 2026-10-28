{{-- resources/views/pdf/quotes/modern.blade.php --}}
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="utf-8">
    <title>Preventivo {{ $quote->number }}</title>
    <style>
        @include('pdf.quotes.partials.styles'):root {
            --quote-primary: {{ $colors['primary'] }};
            --quote-accent: {{ $colors['accent'] }};
        }

        /* ---------- Variante modern ---------- */
        .modern .header {
            align-items: center;
            padding: 22px 26px;
            border: 0;
            border-radius: 10px;
            background: var(--quote-primary);
            color: #fff;
        }

        .modern .companyName {
            font-size: 17px;
            color: #fff;
        }

        .modern .companyMeta {
            font-size: 10.5px;
            color: rgba(255, 255, 255, .8);
        }

        .modern .logoBox {
            display: inline-block;
            padding: 8px 10px;
            border-radius: 8px;
            background: #fff;
        }

        .modern .logoBox .logo {
            margin: 0;
        }

        .modern .docMeta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
        }

        .modern .docMeta h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
            color: #fff;
        }

        .modern .pill {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 999px;
            background: var(--quote-accent);
            color: #fff;
            font-size: 12px;
            font-weight: 700;
        }

        .modern .clientSection,
        .modern .validity {
            padding: 14px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #f9fafb;
        }

        .modern .table th {
            background: transparent;
            color: var(--quote-primary);
            border-bottom: 2px solid var(--quote-primary);
        }

        .modern .table td {
            border-bottom: 1px solid #eef0f3;
        }

        .modern .table tbody tr:nth-child(even) {
            background: transparent;
        }

        .modern .totals .grandTotal {
            margin-top: .5rem;
            padding: 10px 12px;
            border-top: none;
            border-radius: 8px;
            background: var(--quote-primary);
            color: #fff;
        }
    </style>
</head>

<body>
    <div class="document modern">

        <header class="header">
            <div class="brand">
                @if ($logo)
                    <div class="logoBox">
                        <img class="logo" src="{{ $logo }}" alt="Logo di {{ $company->name }}">
                    </div>
                @endif
                @include('pdf.quotes.partials.company')
            </div>

            <div class="docMeta">
                <h1>Preventivo</h1>
                <span class="pill">{{ filled($quote->number) ? $quote->number : '—' }}</span>
            </div>
        </header>

        @include('pdf.quotes.partials.body', [
            'quote' => $quote,
            'company' => $company,
            'settings' => $settings ?? null,
            'client' => $client ?? null,
            'contact' => $contact ?? [],
            'items' => $items,
            'totals' => $totals,
            'colors' => $colors,
            'dates' => $dates,
            'money' => $money,
            'qty' => $qty,
            'discountLabel' => $discountLabel,
        ])

    </div>
</body>

</html>
