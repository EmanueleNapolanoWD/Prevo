<?php

namespace App\Domains\Companies\Requests;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Validazione dei dati azienda (creazione e modifica).
 *
 * Struttura del payload:
 *  - campi piatti sulla tabella `companies` (anagrafica, dati fiscali, REA, sito, logo)
 *  - tre liste di righe correlate: `emails`, `phones`, `addresses`
 *    (tabelle company_emails / company_phones / company_addresses),
 *    ognuna con ESATTAMENTE una riga marcata `is_primary`.
 *
 * La sincronizzazione delle liste sul DB (create/update/delete delle righe)
 * NON si fa qui: sta in UpdateCompanyAction (questa classe valida soltanto).
 */
class CompanyRequest extends FormRequest
{
    private const COUNTRIES = ['IT', 'DE', 'FR', 'ES', 'AT', 'CH', 'BE', 'NL', 'PT', 'GB'];

    private const LEGAL_FORMS = [
        'DITTA_INDIVIDUALE',
        'SRL',
        'SRLS',
        'SPA',
        'SNC',
        'SAS',
        'SOCIETA_SEMPLICE',
        'ALTRO',
    ];

    /** Regimi fiscali FatturaPA (RF03 non esiste, RF20 = regime transfrontaliero). */
    private const TAX_REGIMES = [
        'RF01',
        'RF02',
        'RF04',
        'RF05',
        'RF06',
        'RF07',
        'RF08',
        'RF09',
        'RF10',
        'RF11',
        'RF12',
        'RF13',
        'RF14',
        'RF15',
        'RF16',
        'RF17',
        'RF18',
        'RF19',
        'RF20',
    ];

    /**
     * L'autorizzazione è demandata alla CompanyPolicy (controller / middleware):
     * qui si valida soltanto la forma dei dati.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalizza l'input prima della validazione, così che maiuscole/minuscole,
     * spazi e prefissi paese (es. "IT01234567890") non aggirino i controlli.
     */
    protected function prepareForValidation(): void
    {
        $country = self::clean($this->input('country_code')) ?? 'IT';

        // P.IVA: via il prefisso paese ("IT01234567890" -> "01234567890")
        $vat = self::clean($this->input('vat_number'));
        if ($vat !== null && str_starts_with($vat, $country)) {
            $vat = substr($vat, strlen($country));
        }

        $shareCapital = $this->input('share_capital');
        if (is_string($shareCapital)) {
            $shareCapital = trim(str_replace(' ', '', $shareCapital));
            // Formato italiano "10.000,50" -> "10000.50"
            if (str_contains($shareCapital, ',')) {
                $shareCapital = str_replace(',', '.', str_replace('.', '', $shareCapital));
            }
        }

        $this->merge([
            // --- campi piatti della company ---
            'country_code' => $country,
            'vat_number' => $vat,
            'tax_code' => self::clean($this->input('tax_code')),
            'sdi_code' => self::clean($this->input('sdi_code')),
            'rea_office' => self::clean($this->input('rea_office')),
            'ateco_code' => self::clean($this->input('ateco_code')),
            'iban' => self::clean($this->input('iban')),
            'share_capital' => $shareCapital,
            'pec' => ($pec = self::trimmed($this->input('pec'))) !== null ? strtolower($pec) : null,

            // --- liste correlate ---
            'emails' => $this->rows('emails', fn (array $r) => [
                ...$r,
                'label' => self::trimmed($r['label'] ?? null),
                'email' => ($email = self::trimmed($r['email'] ?? null)) !== null ? strtolower($email) : null,
                'is_primary' => self::toBool($r['is_primary'] ?? false),
            ]),

            'phones' => $this->rows('phones', fn (array $r) => [
                ...$r,
                'label' => self::trimmed($r['label'] ?? null),
                'number' => self::trimmed($r['number'] ?? null),
                'is_primary' => self::toBool($r['is_primary'] ?? false),
            ]),

            'addresses' => $this->rows('addresses', function (array $r) use ($country) {
                // Se la riga non indica un paese, eredita quello dell'azienda
                $rowCountry = self::clean($r['country_code'] ?? null) ?? $country;

                return [
                    ...$r,
                    'label' => self::trimmed($r['label'] ?? null),
                    'address' => self::trimmed($r['address'] ?? null),
                    'city' => self::trimmed($r['city'] ?? null),
                    'postal_code' => self::trimmed($r['postal_code'] ?? null),
                    // Provincia italiana: sigla maiuscola senza spazi ("na" -> "NA").
                    // Estero: testo libero, gli spazi vanno preservati.
                    'province' => $rowCountry === 'IT'
                        ? self::clean($r['province'] ?? null)
                        : self::trimmed($r['province'] ?? null),
                    'country_code' => $rowCountry,
                    'is_primary' => self::toBool($r['is_primary'] ?? false),
                ];
            }),
        ]);
    }

    /**
     * Regole di validazione.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $country = (string) $this->input('country_code', 'IT');
        $isItaly = $country === 'IT';
        $companyId = $this->currentCompanyId();

        return [
            // ---------- AZIENDA - anagrafica ----------
            'name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:255'],
            'legal_form' => ['nullable', 'string', Rule::in(self::LEGAL_FORMS)],

            // ---------- AZIENDA - dati fiscali ----------
            'country_code' => ['required', 'string', Rule::in(self::COUNTRIES)],
            'vat_number' => [
                'bail',
                'required',
                'string',
                'max:20',
                // prima il controllo formale (economico), poi la query di unicità
                function (string $attribute, mixed $value, Closure $fail) use ($isItaly) {
                    if ($isItaly && ! self::isValidItalianVat((string) $value)) {
                        $fail('La partita IVA non è valida.');
                    }
                },
                // stessa unicità della migration: coppia paese + P.IVA (soft delete incluso)
                Rule::unique('companies', 'vat_number')
                    ->where('country_code', $country)
                    ->ignore($companyId),
            ],
            // 16 caratteri (tollerante alle omocodie) per persone fisiche/ditte individuali,
            // 11 cifre per le società
            'tax_code' => [
                Rule::requiredIf($isItaly),
                'nullable',
                'string',
                'max:20',
                Rule::when($isItaly, [
                    'regex:/^([A-Z]{6}[0-9LMNPQRSTUV]{2}[A-EHLMPR-T][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]|\d{11})$/',
                ]),
            ],
            'tax_regime' => ['nullable', 'string', Rule::in(self::TAX_REGIMES)],
            'sdi_code' => ['nullable', 'string', 'size:7', 'alpha_num'],
            'pec' => ['nullable', 'email', 'max:255'],

            // ---------- AZIENDA - dati REA e societari ----------
            'rea_office' => ['nullable', 'string', 'size:2', 'alpha'],
            'rea_number' => ['nullable', 'string', 'max:20'],
            'share_capital' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'ateco_code' => ['nullable', 'string', 'regex:/^\d{2}(\.\d{1,2}){0,2}$/'],
            'iban' => [
                'nullable',
                'string',
                'max:34',
                function (string $attribute, mixed $value, Closure $fail) {
                    if (! self::isValidIban((string) $value)) {
                        $fail('L\'IBAN non è valido.');
                    }
                },
            ],

            // ---------- CONTATTI - email ----------
            // `id` presente = riga esistente da aggiornare (deve appartenere a QUESTA azienda);
            // `id` assente = nuova riga da creare.
            'emails' => ['required', 'array', 'min:1', 'max:10'],
            'emails.*.id' => ['nullable', 'uuid', ...$this->ownedRowRule('company_emails', $companyId)],
            'emails.*.label' => ['nullable', 'string', 'max:50'],
            'emails.*.email' => ['required', 'email', 'max:255', 'distinct:ignore_case'],
            'emails.*.is_primary' => ['required', 'boolean'],

            // ---------- CONTATTI - telefoni ----------
            'phones' => ['required', 'array', 'min:1', 'max:10'],
            'phones.*.id' => ['nullable', 'uuid', ...$this->ownedRowRule('company_phones', $companyId)],
            'phones.*.label' => ['nullable', 'string', 'max:50'],
            'phones.*.number' => ['required', 'string', 'max:30', 'regex:/^\+?[0-9\s().\-]{6,30}$/', 'distinct'],
            'phones.*.is_primary' => ['required', 'boolean'],

            // ---------- INDIRIZZI (sede legale = riga principale) ----------
            'addresses' => ['required', 'array', 'min:1', 'max:10'],
            'addresses.*.id' => ['nullable', 'uuid', ...$this->ownedRowRule('company_addresses', $companyId)],
            'addresses.*.label' => ['nullable', 'string', 'max:50'],
            'addresses.*.address' => ['required', 'string', 'max:255'],
            'addresses.*.city' => ['required', 'string', 'max:100'],
            'addresses.*.country_code' => ['required', 'string', Rule::in(self::COUNTRIES)],
            // CAP e provincia dipendono dal paese DELLA RIGA (un'azienda italiana
            // può avere una sede operativa all'estero e viceversa): regole per-riga.
            'addresses.*.postal_code' => Rule::forEach(fn (mixed $value, string $attribute) => [
                'required',
                'string',
                'max:10',
                ...($this->isItalianAddress($attribute) ? ['regex:/^\d{5}$/'] : []),
            ]),
            'addresses.*.province' => Rule::forEach(fn (mixed $value, string $attribute) => $this->isItalianAddress($attribute)
                ? ['required', 'string', 'size:2', 'alpha']
                : ['required', 'string', 'max:100']),
            'addresses.*.is_primary' => ['required', 'boolean'],

            // ---------- ALTRO ----------
            'website' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'], // KB
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Controlli che coinvolgono più campi insieme: per ogni lista deve esserci
     * ESATTAMENTE una riga principale. L'errore viene associato alla chiave
     * della lista ("emails", "phones", "addresses").
     *
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator) {
            $labels = ['emails' => 'email', 'phones' => 'telefono', 'addresses' => 'indirizzo'];

            foreach ($labels as $key => $label) {
                $rows = $this->input($key);

                // Se la lista è già invalida (mancante, non array...) l'errore c'è già
                if (! is_array($rows) || $validator->errors()->has($key)) {
                    continue;
                }

                $primaries = collect($rows)
                    ->filter(fn ($row) => is_array($row) && ($row['is_primary'] ?? false) === true)
                    ->count();

                if ($primaries !== 1) {
                    $validator->errors()->add($key, "Seleziona esattamente un {$label} principale.");
                }
            }
        }];
    }

    /** Nomi leggibili degli attributi nei messaggi di errore. */
    public function attributes(): array
    {
        return [
            // Anagrafica e dati fiscali
            'name' => 'nome azienda',
            'legal_name' => 'ragione sociale',
            'legal_form' => 'forma giuridica',
            'country_code' => 'paese',
            'vat_number' => 'partita IVA',
            'tax_code' => 'codice fiscale',
            'tax_regime' => 'regime fiscale',
            'sdi_code' => 'codice SDI',
            'pec' => 'PEC',
            'rea_office' => 'ufficio REA',
            'rea_number' => 'numero REA',
            'share_capital' => 'capitale sociale',
            'ateco_code' => 'codice ATECO',
            'iban' => 'IBAN',

            // Liste correlate
            'emails' => 'email',
            'emails.*.email' => 'email',
            'emails.*.label' => 'etichetta email',
            'phones' => 'telefono',
            'phones.*.number' => 'telefono',
            'phones.*.label' => 'etichetta telefono',
            'addresses' => 'indirizzo',
            'addresses.*.address' => 'indirizzo',
            'addresses.*.city' => 'città',
            'addresses.*.province' => 'provincia',
            'addresses.*.postal_code' => 'CAP',
            'addresses.*.country_code' => 'paese',
            'addresses.*.label' => 'etichetta indirizzo',

            // Altro
            'website' => 'sito web',
            'logo' => 'logo',
            'remove_logo' => 'rimozione logo',
        ];
    }

    /** Messaggi di errore personalizzati (in italiano). */
    public function messages(): array
    {
        return [
            // Anagrafica
            'name.required' => 'Il campo nome azienda è obbligatorio.',
            'name.max' => 'Il nome azienda non può superare 150 caratteri.',
            'legal_name.required' => 'Il campo ragione sociale è obbligatorio.',
            'legal_name.max' => 'La ragione sociale non può superare 255 caratteri.',
            'legal_form.in' => 'La forma giuridica selezionata non è valida.',

            // Dati fiscali
            'country_code.required' => 'Il campo paese è obbligatorio.',
            'country_code.in' => 'Il paese selezionato non è supportato.',
            'vat_number.required' => 'Il campo partita IVA è obbligatorio.',
            'vat_number.max' => 'La partita IVA non può superare 20 caratteri.',
            'vat_number.unique' => 'La partita IVA è già in uso.',
            'tax_code.required' => 'Il campo codice fiscale è obbligatorio.',
            'tax_code.regex' => 'Il codice fiscale non è valido.',
            'tax_regime.in' => 'Il regime fiscale selezionato non è valido.',
            'sdi_code.size' => 'Il codice SDI deve essere di 7 caratteri.',
            'sdi_code.alpha_num' => 'Il codice SDI può contenere solo lettere e numeri.',
            'pec.email' => 'Il campo PEC deve essere un indirizzo email valido.',

            // REA e societari
            'rea_office.size' => 'La provincia dell\'ufficio REA deve essere di 2 lettere (es. NA).',
            'rea_office.alpha' => 'La provincia dell\'ufficio REA deve contenere solo lettere.',
            'rea_number.max' => 'Il numero REA non può superare 20 caratteri.',
            'share_capital.numeric' => 'Il capitale sociale deve essere un importo valido.',
            'share_capital.min' => 'Il capitale sociale non può essere negativo.',
            'ateco_code.regex' => 'Il codice ATECO non è valido (es. 62.01 o 62.01.00).',

            // Email
            'emails.required' => 'Inserisci almeno un indirizzo email.',
            'emails.min' => 'Inserisci almeno un indirizzo email.',
            'emails.max' => 'Puoi inserire al massimo 10 indirizzi email.',
            'emails.*.id.exists' => 'L\'indirizzo email selezionato non appartiene a questa azienda.',
            'emails.*.email.required' => 'Il campo email è obbligatorio.',
            'emails.*.email.email' => 'Inserisci un indirizzo email valido.',
            'emails.*.email.distinct' => 'Hai inserito lo stesso indirizzo email più volte.',

            // Telefoni
            'phones.required' => 'Inserisci almeno un numero di telefono.',
            'phones.min' => 'Inserisci almeno un numero di telefono.',
            'phones.max' => 'Puoi inserire al massimo 10 numeri di telefono.',
            'phones.*.id.exists' => 'Il numero di telefono selezionato non appartiene a questa azienda.',
            'phones.*.number.required' => 'Il campo telefono è obbligatorio.',
            'phones.*.number.regex' => 'Il numero di telefono non è valido.',
            'phones.*.number.distinct' => 'Hai inserito lo stesso numero di telefono più volte.',

            // Indirizzi
            'addresses.required' => 'Inserisci almeno un indirizzo.',
            'addresses.min' => 'Inserisci almeno un indirizzo.',
            'addresses.max' => 'Puoi inserire al massimo 10 indirizzi.',
            'addresses.*.id.exists' => 'L\'indirizzo selezionato non appartiene a questa azienda.',
            'addresses.*.address.required' => 'Il campo indirizzo è obbligatorio.',
            'addresses.*.city.required' => 'Il campo città è obbligatorio.',
            'addresses.*.country_code.in' => 'Il paese selezionato non è supportato.',
            'addresses.*.postal_code.required' => 'Il campo CAP è obbligatorio.',
            'addresses.*.postal_code.regex' => 'Il CAP deve essere di 5 cifre.',
            'addresses.*.province.required' => 'Il campo provincia è obbligatorio.',
            'addresses.*.province.size' => 'La provincia deve essere di 2 lettere (es. NA).',
            'addresses.*.province.alpha' => 'La provincia deve contenere solo lettere.',

            // Sito e logo
            'website.url' => 'Il sito web deve essere un URL valido (es. https://esempio.it).',
            'logo.file' => 'Il logo deve essere un file valido.',
            'logo.uploaded' => 'Caricamento del logo non riuscito: il file è troppo grande o il trasferimento è stato interrotto.',
            'logo.mimes' => 'Il logo deve essere un file PNG, JPG o WebP.',
            'logo.max' => 'Il logo non può superare i 2 MB.',
            'remove_logo.boolean' => 'Il valore di rimozione del logo non è valido.',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER PRIVATI
    |--------------------------------------------------------------------------
    */

    /**
     * Id dell'azienda in modifica (null in creazione), per escludere il record
     * stesso dai controlli di unicità. Funziona sia con route model binding
     * sia con un id grezzo, a patto che il parametro di rotta si chiami "company".
     *
     * ATTENZIONE: se la rotta usa lo slug del tenant (es. /{slug}/settings) e non
     * un parametro "company", qui ottieni null o lo slug: in quel caso ricava
     * l'id dal tenant corrente (es. Company::current()?->getKey()).
     */
    private function currentCompanyId(): int|string|null
    {
        $company = $this->route('company');

        return $company instanceof Model ? $company->getKey() : $company;
    }

    /**
     * Regola `exists` per l'id di una riga correlata: la riga deve esistere E
     * appartenere all'azienda in modifica, altrimenti un utente potrebbe passare
     * l'id di una riga di un'altra azienda e modificarla. In creazione nessuna
     * riga può esistere ancora, quindi la regola non si applica.
     *
     * @return array<int, ValidationRule>
     */
    private function ownedRowRule(string $table, int|string|null $companyId): array
    {
        return $companyId
            ? [Rule::exists($table, 'id')->where('company_id', $companyId)]
            : [];
    }

    /**
     * Il paese della riga indirizzo è italiano?
     * $attribute ha la forma "addresses.0.postal_code": si risale alla riga
     * "addresses.0" e si legge il suo country_code (già normalizzato in
     * prepareForValidation, con fallback sul paese dell'azienda).
     */
    private function isItalianAddress(string $attribute): bool
    {
        $row = Str::beforeLast($attribute, '.');
        $rowCountry = data_get($this->all(), "{$row}.country_code");

        return ($rowCountry ?: $this->input('country_code', 'IT')) === 'IT';
    }

    /**
     * Applica una normalizzazione a ogni riga di una lista. Le righe che non
     * sono array restano intatte (falliranno la validazione); se la lista manca
     * o non è un array diventa [] e verrà respinta da `required`/`array`.
     *
     * @param  callable(array<string, mixed>): array<string, mixed>  $fn
     * @return array<int|string, mixed>
     */
    private function rows(string $key, callable $fn): array
    {
        $rows = $this->input($key);

        return is_array($rows)
            ? array_map(fn ($row) => is_array($row) ? $fn($row) : $row, $rows)
            : [];
    }

    /**
     * Rimuove tutti gli spazi e porta in maiuscolo. Restituisce null per valori
     * vuoti o non stringa, che poi falliscono (o passano, se nullable) normalmente.
     * Da usare per codici (P.IVA, CF, IBAN, SDI, sigle), NON per testo libero.
     */
    private static function clean(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = strtoupper(preg_replace('/\s+/', '', $value) ?? '');

        return $value === '' ? null : $value;
    }

    /**
     * Trim di un testo libero (mantiene maiuscole e spazi interni).
     * Restituisce null per valori vuoti o non stringa.
     */
    private static function trimmed(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * Converte "true"/"1"/"on"/true in bool. Necessario perché con un FormData
     * (usato per l'upload del logo) i booleani arrivano come stringhe, e la regola
     * `boolean` di Laravel non accetta "true"/"false".
     */
    private static function toBool(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Controllo formale della P.IVA italiana: 11 cifre + cifra di controllo (algoritmo di Luhn).
     * Verifica solo la correttezza formale, non che la partita IVA esista davvero.
     */
    private static function isValidItalianVat(string $vat): bool
    {
        if (! preg_match('/^\d{11}$/', $vat)) {
            return false;
        }

        $sum = 0;

        for ($i = 0; $i < 10; $i++) {
            $digit = (int) $vat[$i];

            if ($i % 2 === 1) { // posizioni pari (2ª, 4ª, ...): raddoppia
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
        }

        return ((10 - ($sum % 10)) % 10) === (int) $vat[10];
    }

    /**
     * Controllo formale dell'IBAN: struttura, lunghezza (27 per l'Italia) e checksum mod 97.
     */
    private static function isValidIban(string $iban): bool
    {
        if (! preg_match('/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/', $iban)) {
            return false;
        }

        if (str_starts_with($iban, 'IT') && strlen($iban) !== 27) {
            return false;
        }

        // Sposta i primi 4 caratteri in coda e converte le lettere in numeri (A=10 ... Z=35)
        $rearranged = substr($iban, 4).substr($iban, 0, 4);

        $numeric = '';
        foreach (str_split($rearranged) as $char) {
            $numeric .= ctype_alpha($char) ? (string) (ord($char) - 55) : $char;
        }

        // mod 97 a blocchi, per non superare PHP_INT_MAX
        $remainder = 0;
        foreach (str_split($numeric, 7) as $chunk) {
            $remainder = (int) ($remainder.$chunk) % 97;
        }

        return $remainder === 1;
    }
}
