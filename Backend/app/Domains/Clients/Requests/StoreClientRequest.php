<?php

namespace App\Domains\Clients\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreClientRequest extends FormRequest
{

    private const TYPES = ['PERSON', 'COMPANY'];
    private const SALUTATIONS = ['Sig.', 'Sig.ra', 'Coniugi', 'Famiglia'];
    private const ADDRESS_TYPES = ['BILLING', 'SHIPPING', 'SITE'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->route('companyId');
        $isPerson = $this->input('type') === 'PERSON';
        $isItaly = ($this->input('country_code') ?? 'IT') === 'IT';
        $isPA = $this->boolean('is_public_administration');


        return [
            // ANAGRAFICA
            'type' => [
                'required',
                Rule::in(self::TYPES),
            ],

            'salutation' => [
                'nullable',
                Rule::in(self::SALUTATIONS),
            ],

            'name' => [
                Rule::requiredIf(fn() => $isPerson && blank($this->input('surname'))),
                'nullable',
                'string',
                'max:100'
            ],

            'surname' => [
                Rule::requiredIf(fn() => $isPerson && blank($this->input('name'))),
                'nullable',
                'string',
                'max:100',
            ],

            'company_name' => [
                'required_if:title, COMPANY',
                'prohibited_if:type,PERSON',
                'nullable',
                'string',
                'max:100',
            ],

            // Contatti non ripetibili
            'pec' => [
                'nullable',
                'email:rfc',
                'max:255'
            ],
            'website' => [
                'nullable',
                'url: http,https',
                'max:255'
            ],

            // DATI FISCALI
            'country_code' => [
                'nullable',
                'string',
                'size:2',
                'alpha'
            ],

            'tax_code' => [
                'nullable',
                'alpha_num',
                $isItaly ? 'min:11' : 'min:3',
                'max:' . ($isItaly ? 16 : 20)
            ],

            'vat_number' => [
                'nullable',
                $isItaly ? 'digits:11' : 'alpha_num',
                'max:20'
            ],
            'sdi_code' => [
                Rule::requiredIf($isPA),
                'nullable',
                'alpha_num',
                //6 caratteri per PA e 7 per privato
                $isPA ? 'size:6' : 'size:7'
            ],
            'default_vat_rate' => [
                'nullable',
                'numeric',
                'between:0,100',
                'decimal:0,2'
            ],
            'is_public_administration' => [
                'sometimes',
                'boolean'
            ],

            //COMMERCIALI E NOTE
            'payment_terms' => [
                'nullable',
                'string',
                'max:100'
            ],

            'note' => [
                'nullable',
                'string',
                'max:5000'
            ],

            // EMAIL multiple
            // Email (multiple)
            'emails' => ['nullable', 'array', 'max:10'],
            'emails.*.email' => ['required', 'email:rfc', 'max:255', 'distinct:ignore_case'],
            'emails.*.label' => ['nullable', 'string', 'max:30'],
            'emails.*.is_primary' => ['sometimes', 'boolean'],

            // Telefoni (multipli, E.164)
            'phones' => ['nullable', 'array', 'max:10'],
            'phones.*.phone' => ['required', 'regex:/^\+[1-9]\d{6,14}$/', 'distinct'],
            'phones.*.label' => ['nullable', 'string', 'max:30'],
            'phones.*.is_primary' => ['sometimes', 'boolean'],


            // Indirizzi (multipli)
            'addresses' => ['nullable', 'array', 'max:10'],
            'addresses.*.type' => ['sometimes', Rule::in(self::ADDRESS_TYPES)],
            'addresses.*.street' => ['required', 'string', 'max:255'],
            'addresses.*.street_number' => ['nullable', 'string', 'max:20'],
            'addresses.*.extra' => ['nullable', 'string', 'max:255'],
            'addresses.*.postal_code' => ['required', 'string', 'max:10'],
            'addresses.*.city' => ['required', 'string', 'max:100'],
            'addresses.*.country_code' => ['sometimes', 'string', 'size:2', 'alpha'],
            'addresses.*.province' => ['nullable', 'alpha', 'size:2'],
            'addresses.*.is_default' => ['sometimes', 'boolean'],

            // Gruppi: solo quelli della stessa azienda
            'group_ids' => ['nullable', 'array', 'max:50'],
            'group_ids.*' => [
                'uuid',
                'distinct',
                Rule::exists('client_groups', 'id')->where('company_id', $companyId),
            ],
        ];
    }

    // Un solo contatto principale per lista, un solo indirizzo predefinito
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach (['emails', 'phones'] as $field) {
                    $primaries = collect($this->input($field, []))->filter(fn($r) => !empty($r['is_primary']));

                    if ($primaries->count() > 1) {
                        $validator->errors()->add($field, 'Puoi indicare un solo contatto principale');
                    };



                    $defaults = collect($this->input('addresses', []))
                        ->filter(fn($a) => !empty($a['is_default']))
                        ->groupBy(fn($a) => $a['type'] ?? 'BILLING');

                    if ($defaults->contains(fn($group) => $group->count() > 1)) {
                        $validator->errors()->add('addresses', 'Puoi indicare un solo indirizzo predefinito per tipologia');
                    }
                }
            }
        ];
    }

    // Normalizazzioen dati
    protected function prapareForValidation(): void
    {
        $data = [];

        if ($this->has('type')) {
            $data['type'] = strtoupper(trim((string) $this->input('type')));
        }
        if ($this->filled('country_code')) {
            $data['country_code'] = strtoupper(trim($this->input('country_code')));
        }
        if ($this->filled('tax_code')) {
            $data['tax_code'] = strtoupper(preg_replace('/\s+/', '', $this->input('tax_code')));
        }
        if ($this->filled('vat_number')) {
            $vat = preg_replace('/\s+/', '', strtoupper($this->input('vat_number')));
            // "IT01234567890" -> "01234567890" per i clienti italiani
            $data['vat_number'] = str_starts_with($vat, 'IT') && ctype_digit(substr($vat, 2)) ? substr($vat, 2) : $vat;
        }
        if ($this->filled('sdi_code')) {
            $data['sdi_code'] = strtoupper(trim($this->input('sdi_code')));
        }
        if ($this->filled('pec')) {
            $data['pec'] = strtolower(trim($this->input('pec')));
        }

        if (is_array($this->input('emails'))) {
            $data['emails'] = array_map(function ($row) {
                if (is_array($row) && isset($row['email'])) {
                    $row['email'] = strtolower(trim($row['email']));
                }
                return $row;
            }, $this->input('emails'));
        }

        if (is_array($this->input('phones'))) {
            $data['phones'] = array_map(function ($row) {
                if (is_array($row) && isset($row['phone'])) {
                    $row['phone'] = $this->toE164($row['phone']);
                }
                return $row;
            }, $this->input('phones'));
        }

        if (is_array($this->input('addresses'))) {
            $data['addresses'] = array_map(function ($row) {
                if (is_array($row)) {
                    foreach (['country_code', 'province', 'type'] as $key) {
                        if (isset($row[$key])) {
                            $row[$key] = strtoupper(trim($row[$key]));
                        }
                    }
                }
                return $row;
            }, $this->input('addresses'));
        }

        $this->merge($data);
    }

    /** Toglie spazi e punteggiatura; senza prefisso internazionale assume +39. */
    private function toE164(string $phone): string
    {
        $phone = preg_replace('/[^\d+]/', '', $phone);

        if (str_starts_with($phone, '00')) {
            return '+' . substr($phone, 2);
        }

        return str_starts_with($phone, '+') ? $phone : '+39' . $phone;
    }

    public function attributes(): array
    {
        return [
            'type' => 'tipologia',
            'name' => 'nome',
            'surname' => 'cognome',
            'company_name' => 'nome azienda',
            'salutation' => 'saluto',
            'tax_code' => 'codice fiscale',
            'vat_number' => 'partita IVA',
            'sdi_code' => 'codice destinatario',
            'default_vat_rate' => 'aliquota fiscale',
            'payment_terms' => 'termini di pagamento',
            'note' => 'nota',
            'emails.*.email' => 'e-mail',
            'phones.*.phone' => 'telefono',
            'addresses.*.street' => 'via',
            'addresses.*.postal_code' => 'codice postale',
            'addresses.*.city' => 'città',
            'addresses.*.province' => 'provincia',
            'group_ids.*' => 'gruppo',
        ];
    }


    public function messages(): array
    {
        return [
            // Tipologia e anagrafica
            'type.required' => 'Seleziona se il contatto è una persona o un’azienda.',
            'type.in' => 'La tipologia deve essere persona o azienda.',
            'salutation.in' => 'Il saluto selezionato non è valido.',
            'name.required' => 'Inserisci almeno il nome o il cognome.',
            'surname.required' => 'Inserisci almeno il nome o il cognome.',
            'name.max' => 'Il nome non può superare :max caratteri.',
            'surname.max' => 'Il cognome non può superare :max caratteri.',
            'company_name.required_if' => 'Inserisci il nome dell’azienda.',
            'company_name.prohibited_if' => 'Il nome azienda non è consentito per una persona.',
            'company_name.max' => 'Il nome azienda non può superare :max caratteri.',

            // Contatti non ripetibili
            'pec.email' => 'Inserisci un indirizzo PEC valido.',
            'website.url' => 'Inserisci un indirizzo web valido, ad esempio https://esempio.it.',

            // Dati fiscali
            'country_code.size' => 'Il codice nazione deve essere di 2 lettere (es. IT).',
            'country_code.alpha' => 'Il codice nazione deve contenere solo lettere.',
            'tax_code.alpha_num' => 'Il codice fiscale può contenere solo lettere e numeri.',
            'tax_code.min' => 'Il codice fiscale deve avere almeno :min caratteri.',
            'tax_code.max' => 'Il codice fiscale non può superare :max caratteri.',
            'vat_number.digits' => 'La partita IVA italiana deve essere di 11 cifre.',
            'vat_number.alpha_num' => 'La partita IVA può contenere solo lettere e numeri.',
            'sdi_code.required' => 'Per la pubblica amministrazione il codice univoco ufficio è obbligatorio.',
            'sdi_code.size' => 'Il codice destinatario deve essere di :size caratteri.',
            'sdi_code.alpha_num' => 'Il codice destinatario può contenere solo lettere e numeri.',
            'default_vat_rate.numeric' => 'L’aliquota fiscale deve essere un numero.',
            'default_vat_rate.between' => 'L’aliquota fiscale deve essere compresa tra :min e :max.',
            'default_vat_rate.decimal' => 'L’aliquota fiscale può avere al massimo 2 decimali.',

            // Commerciale e note
            'payment_terms.max' => 'I termini di pagamento non possono superare :max caratteri.',
            'note.max' => 'La nota non può superare :max caratteri.',

            // Email
            'emails.max' => 'Puoi inserire al massimo :max indirizzi e-mail.',
            'emails.*.email.required' => 'Inserisci l’indirizzo e-mail oppure rimuovi la riga.',
            'emails.*.email.email' => 'L’indirizzo e-mail non è valido.',
            'emails.*.email.distinct' => 'Hai inserito due volte lo stesso indirizzo e-mail.',
            'emails.*.label.max' => 'L’etichetta dell’e-mail non può superare :max caratteri.',

            // Telefoni
            'phones.max' => 'Puoi inserire al massimo :max numeri di telefono.',
            'phones.*.phone.required' => 'Inserisci il numero di telefono oppure rimuovi la riga.',
            'phones.*.phone.regex' => 'Il numero di telefono non è valido. Usa il formato internazionale, ad esempio +39 333 1234567.',
            'phones.*.phone.distinct' => 'Hai inserito due volte lo stesso numero di telefono.',
            'phones.*.label.max' => 'L’etichetta del telefono non può superare :max caratteri.',

            // Indirizzi
            'addresses.max' => 'Puoi inserire al massimo :max indirizzi.',
            'addresses.*.type.in' => 'La tipologia di indirizzo non è valida.',
            'addresses.*.street.required' => 'Inserisci la via dell’indirizzo.',
            'addresses.*.postal_code.required' => 'Inserisci il codice postale.',
            'addresses.*.city.required' => 'Inserisci la città.',
            'addresses.*.province.alpha' => 'La provincia deve contenere solo lettere.',
            'addresses.*.province.size' => 'La provincia deve essere indicata con la sigla di 2 lettere (es. NA).',
            'addresses.*.country_code.size' => 'Il codice nazione dell’indirizzo deve essere di 2 lettere.',

            // Gruppi
            'group_ids.max' => 'Puoi assegnare al massimo :max gruppi.',
            'group_ids.*.uuid' => 'Il gruppo selezionato non è valido.',
            'group_ids.*.exists' => 'Il gruppo selezionato non esiste.',
            'group_ids.*.distinct' => 'Hai selezionato due volte lo stesso gruppo.',
        ];
    }

}
