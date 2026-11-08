@verbatim
<style>
/* ==========================================================================
   Reset equivalente al preflight di Tailwind 4 (l'app Next lo carica, quindi
   l'anteprima React ne dipende: box-sizing, margini azzerati, h2/h3 senza
   peso/dimensione propri, ecc.). Se in Prevo il preflight è disattivato,
   elimina questo blocco.
   ========================================================================== */
*, ::after, ::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  /* SOSTITUIRE con il font usato dall'app Next, se diverso dal default Tailwind */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
strong, b { font-weight: bolder; }
img { display: block; vertical-align: middle; max-width: 100%; height: auto; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }

/* ==========================================================================
   QuoteDocument (radice) + footer
   Differenze volute rispetto allo schermo: niente border-radius/box-shadow
@verbatim
<style>
/* ==========================================================================
   Reset equivalente al preflight di Tailwind 4 (l'app Next lo carica, quindi
   l'anteprima React ne dipende: box-sizing, margini azzerati, h2/h3 senza
   peso/dimensione propri, ecc.). Se in Prevo il preflight è disattivato,
   elimina questo blocco.
   ========================================================================== */
*, ::after, ::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  /* SOSTITUIRE con il font usato dall'app Next, se diverso dal default Tailwind */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
strong, b { font-weight: bolder; }
img { display: block; vertical-align: middle; max-width: 100%; height: auto; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }

/* ==========================================================================
   QuoteDocument (radice) + footer
   Differenze volute rispetto allo schermo: niente border-radius/box-shadow
   (sono della "carta" nell'editor) e niente media query mobile (il PDF ha
   larghezza fissa).
   ========================================================================== */
.qd {
  --quote-primary: {{ $colors["primary"] ?? '#1f2937' }};
  --quote-accent: {{ $colors["accent"] ?? '#3b82f6' }};
</style>
@endverbatim

  background: #fff;
  color: #111827;
  max-width: 794px; /* ~A4 */
  margin: 0 auto;
  padding: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.qd-footer {
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 0.7rem;
  color: #9ca3af;
}

/* ==========================================================================
   QuoteDocumentHeader + logo
   ========================================================================== */
.qd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 3px solid var(--quote-primary);
  margin-bottom: 1.5rem;
}

.qd-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 0;
}

/* Il logo non supera mai 140×56 px e mantiene le proporzioni */
.qd-logo {
  display: block;
  width: auto;
  height: auto;
  max-width: 140px;
  max-height: 56px;
  object-fit: contain;
}

.qd-company-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

/* Definita PRIMA di .qd-company-name: come nell'originale, .qd-company-name vince
   e "La tua azienda" resta nel colore primario. */
.qd-company-muted {
  color: #9ca3af;
}

.qd-company-name {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--quote-primary);
}

.qd-company-meta {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #6b7280;
  overflow-wrap: anywhere;
}

.qd-doc-meta {
  flex-shrink: 0;
  text-align: right;
}

.qd-eyebrow {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--quote-accent);
}

.qd-number {
  margin: 0;
  color: #6b7280;
}

/* Varianti template */
[data-template="modern"] .qd-header {
  border-bottom: none;
  border-left: 6px solid var(--quote-accent);
  padding-left: 1rem;
}

[data-template="minimal"] .qd-header {
  border-bottom-width: 1px;
}

/* ==========================================================================
   QuoteSectionTitle
   ========================================================================== */
.qd-section-title {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--quote-accent);
}

/* ==========================================================================
   QuoteTitleBlock
   ========================================================================== */
/* Prima di ".qd-title-block h2": come nell'originale, il colore primario
   prevale e il placeholder non risulta grigio. */
.qd-title-muted {
  color: #9ca3af;
}

.qd-title-block {
  margin: 1.5rem 0 1.25rem;
}

.qd-title-block h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.25;
  color: var(--quote-primary);
}

.qd-title-block .qd-description {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  line-height: 1.55;
  color: #4b5563;
  white-space: pre-line;
}

/* ==========================================================================
   QuoteRecipient
   ========================================================================== */
.qd-meta-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.qd-client-muted {
  color: #9ca3af;
}

.qd-client p {
  margin: 0;
  color: #374151;
}

.qd-validity strong {
  color: #374151;
}

.qd-validity {
  text-align: right;
}

/* ==========================================================================
   QuoteItemsTable
   ========================================================================== */
.qd-items-section {
  margin-bottom: 1.5rem;
}

.qd-placeholder {
  margin: 0;
  color: #9ca3af;
  padding: 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.qd-table {
  width: 100%;
  border-collapse: collapse;
}

.qd-table th {
  background: var(--quote-primary);
  color: #fff;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  padding: 0.5rem 0.75rem;
}

.qd-table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.qd-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.qd-num {
  text-align: right !important;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.qd-item-name {
  display: block;
  font-weight: 600;
}

.qd-item-desc {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  white-space: pre-line;
}

[data-template="minimal"] .qd-table th {
  background: transparent;
  color: var(--quote-primary);
  border-bottom: 2px solid var(--quote-primary);
}

/* ==========================================================================
   QuoteTotals
   ========================================================================== */
.qd-totals-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.qd-totals {
  margin: 0;
  width: min(100%, 280px);
}

.qd-totals > div {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.qd-totals dt {
  color: #6b7280;
}

.qd-totals dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.qd-totals .qd-grand-total {
  border-bottom: none;
  border-top: 2px solid var(--quote-primary);
  margin-top: 0.25rem;
  padding-top: 0.6rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--quote-primary);
}

/* Deve restare dopo ".qd-totals dt" (stessa specificità) */
.qd-grand-total dt {
  color: inherit;
}

/* Estensione (non presente in QuoteDocument): riga "Da pagare" quando c'è il bollo */
.qd-totals .qd-payable {
  font-weight: 700;
  color: var(--quote-primary);
}
.qd-payable dt {
  color: inherit;
}

/* ==========================================================================
   QuotePaymentInfo
   ========================================================================== */
.qd-payment {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--quote-accent);
  background: #f9fafb;
  font-size: 0.8rem;
}

.qd-payment p {
  margin: 0.25rem 0 0;
}

.qd-iban {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.02em;
}

/* ==========================================================================
   QuoteTextSection (Note / Condizioni)
   ========================================================================== */
.qd-terms {
  margin-bottom: 1rem;
}

.qd-terms strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--quote-primary);
}

.qd-terms p {
  margin: 0;
  color: #4b5563;
  font-size: 0.8rem;
  white-space: pre-line;
}

/* ==========================================================================
   Solo paginazione PDF (nessun effetto visivo): righe e blocchi non si spezzano
   ========================================================================== */
.qd-table tr,
.qd-totals-section,
.qd-payment,
.qd-terms {
  break-inside: avoid;
}
</style>
@endverbatim
