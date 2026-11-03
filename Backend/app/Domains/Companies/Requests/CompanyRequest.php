<?php

namespace App\Domains\Companies\Requests;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     * Determine if the user is authorized to make this request.
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

        $email = $this->input('company_email');
        $pec = $this->input('pec');

        $this->merge([
            'country_code' => $country,
            'vat_number' => $vat,
            'tax_code' => self::clean($this->input('tax_code')),
            'sdi_code' => self::clean($this->input('sdi_code')),
            'province' => self::clean($this->input('province')),
            'rea_office' => self::clean($this->input('rea_office')),
            'ateco_code' => self::clean($this->input('ateco_code')),
            'iban' => self::clean($this->input('iban')),
            'share_capital' => $shareCapital,
            'company_email' => is_string($email) ? strtolower(trim($email)) : $email,
            'pec' => is_string($pec) ? strtolower(trim($pec)) : $pec,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $country = (string) $this->input('country_code', 'IT');
        $isItaly = $country === 'IT';
        $companyId = $this->currentCompanyId();

        return [
            // AZIENDA - anagrafica
            'name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:255'],
            'legal_form' => ['nullable', 'string', Rule::in(self::LEGAL_FORMS)],

            // AZIENDA - dati fiscali
            'country_code' => ['required', 'string', Rule::in(self::COUNTRIES)],
            'vat_number' => [
                'bail',
                'required',
                'string',
                'max:20',
                // prima il controllo formale (economico), poi la query di unicità
                function (string $attribute, mixed $value, Closure $fail) use ($isItaly) {
                    if ($isItaly && !self::isValidItalianVat((string) $value)) {
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

            // AZIENDA - dati REA e societari
            'rea_office' => ['nullable', 'string', 'size:2', 'alpha'],
            'rea_number' => ['nullable', 'string', 'max:20'],
            'share_capital' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'ateco_code' => ['nullable', 'string', 'regex:/^\d{2}(\.\d{1,2}){0,2}$/'],
            'iban' => [
                'nullable',
                'string',
                'max:34',
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!self::isValidIban((string) $value)) {
                        $fail('L\'IBAN non è valido.');
                    }
                },
            ],

            // AZIENDA - sede legale
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => [
                'required',
                'string',
                'max:10',
                Rule::when($isItaly, ['regex:/^\d{5}$/']),
            ],
            'city' => ['required', 'string', 'max:100'],
            'province' => $isItaly
                ? ['required', 'string', 'size:2', 'alpha']
                : ['required', 'string', 'max:100'],

            // AZIENDA - contatti
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('companies', 'email')->ignore($companyId),
            ],
            'phone' => ['required', 'string', 'max:30', 'regex:/^\+?[0-9\s().\-]{6,30}$/'],
            'website' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'], // KB
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
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
            'address' => 'indirizzo',
            'postal_code' => 'CAP',
            'city' => 'città',
            'province' => 'provincia',
            'email' => 'email aziendale',
            'phone' => 'telefono aziendale',
            'website' => 'sito web',
            'logo' => 'logo',
            'remove_logo' => 'rimozione logo',
        ];
    }

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

            // Sede legale
            'address.required' => 'Il campo indirizzo è obbligatorio.',
            'postal_code.required' => 'Il campo CAP è obbligatorio.',
            'postal_code.regex' => 'Il CAP deve essere di 5 cifre.',
            'city.required' => 'Il campo città è obbligatorio.',
            'province.required' => 'Il campo provincia è obbligatorio.',
            'province.size' => 'La provincia deve essere di 2 lettere (es. NA).',
            'province.alpha' => 'La provincia deve contenere solo lettere.',

            // Contatti
            'email.required' => 'Il campo email aziendale è obbligatorio.',
            'email.email' => 'Il campo email aziendale deve essere un indirizzo email valido.',
            'email.unique' => 'L\'indirizzo email aziendale è già in uso.',
            'phone.required' => 'Il campo telefono aziendale è obbligatorio.',
            'phone.regex' => 'Il numero di telefono non è valido.',
            'website.url' => 'Il sito web deve essere un URL valido (es. https://esempio.it).',

            'logo.file' => 'Il logo deve essere un file valido.',
            'logo.uploaded' => 'Caricamento del logo non riuscito: il file è troppo grande o il trasferimento è stato interrotto.',
            'logo.mimes' => 'Il logo deve essere un file PNG, JPG o WebP.',
            'logo.max' => 'Il logo non può superare i 2 MB.',
            'remove_logo.boolean' => 'Il valore di rimozione del logo non è valido.',
        ];
    }

    /**
     * Id dell'azienda in modifica (null in creazione), per escludere il record
     * stesso dai controlli di unicità. Funziona sia con route model binding
     * sia con un id grezzo, a patto che il parametro di rotta si chiami "company".
     */
    private function currentCompanyId(): int|string|null
    {
        $company = $this->route('company');

        return $company instanceof Model ? $company->getKey() : $company;
    }

    /**
     * Rimuove gli spazi e porta in maiuscolo. Restituisce null per valori
     * vuoti o non stringa, che poi falliscono (o passano, se nullable) normalmente.
     */
    private static function clean(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = strtoupper(preg_replace('/\s+/', '', $value) ?? '');

        return $value === '' ? null : $value;
    }

    /**
     * Controllo formale della P.IVA italiana: 11 cifre + cifra di controllo (algoritmo di Luhn).
     * Verifica solo la correttezza formale, non che la partita IVA esista davvero.
     */
    private static function isValidItalianVat(string $vat): bool
    {
        if (!preg_match('/^\d{11}$/', $vat)) {
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
        if (!preg_match('/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/', $iban)) {
            return false;
        }

        if (str_starts_with($iban, 'IT') && strlen($iban) !== 27) {
            return false;
        }

        $rearranged = substr($iban, 4) . substr($iban, 0, 4);

        $numeric = '';
        foreach (str_split($rearranged) as $char) {
            $numeric .= ctype_alpha($char) ? (string) (ord($char) - 55) : $char;
        }

        // mod 97 a blocchi, per non superare PHP_INT_MAX
        $remainder = 0;
        foreach (str_split($numeric, 7) as $chunk) {
            $remainder = (int) ($remainder . $chunk) % 97;
        }

        return $remainder === 1;
    }
}