<?php

namespace App\Domains\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalizza i dati PRIMA della validazione (maiuscole, minuscole, pulizia P.IVA, ecc.).
     */
    protected function prepareForValidation(): void
    {

        $country = strtoupper(trim((string) $this->input('country_code', 'IT'))) ?: 'IT';
        $normalized = ['country_code' => $country];

        // Campi da convertire in minuscolo
        foreach (['email', 'company_email', 'pec'] as $field) {
            if ($this->filled($field)) {
                $normalized[$field] = mb_strtolower(trim((string) $this->input($field)));
            }
        }

        // Campi da convertire in maiuscolo
        foreach (['province', 'sdi_code', 'tax_code', 'tax_regime'] as $field) {
            if ($this->filled($field)) {
                $normalized[$field] = strtoupper(trim((string) $this->input($field)));
            }
        }

        // Pulizia Partita IVA (rimozione spazi/caratteri speciali ed eventuale prefisso paese)
        if ($this->filled('vat_number')) {
            $vat = preg_replace('/[^A-Za-z0-9]/', '', (string) $this->input('vat_number'));

            if (str_starts_with(strtoupper($vat), $country)) {
                $vat = substr($vat, strlen($country));
            }

            $normalized['vat_number'] = strtoupper($vat);
        }

        $this->merge($normalized);
    }


    public function rules(): array
    {
        return [
            // --- DATI ACCOUNT UTENTE ---
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],

            // --- DATI AZIENDA ---
            'company_name' => ['required', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'vat_number' => ['nullable', 'string', 'max:50'],
            'country_code' => ['required', 'string', 'size:2'],
            'tax_code' => ['nullable', 'string', 'max:50'],
            'pec' => ['nullable', 'email', 'max:255'],
            'iban' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],

            // --- LISTE MULTIPLE (Telefoni, Email, Indirizzi) ---
            'phones' => ['nullable', 'array'],
            'phones.*.phone' => ['required', 'string'],
            'phones.*.is_primary' => ['boolean'],
            'phones.*.label' => ['nullable', 'string'],

            'emails' => ['nullable', 'array'],
            'emails.*.email' => ['required', 'email'],
            'emails.*.is_primary' => ['boolean'],
            'emails.*.label' => ['nullable', 'string'],

            'addresses' => ['nullable', 'array'],
            'addresses.*.address' => ['required', 'string'],
            'addresses.*.city' => ['required', 'string'],
            'addresses.*.postal_code' => ['required', 'string'],
            'addresses.*.country_code' => ['required', 'string', 'size:2'],
            'addresses.*.province' => ['required', 'string'],
            'addresses.*.is_primary' => ['boolean'],
            'addresses.*.label' => ['nullable', 'string'],
        ];
    }

    /**
     * Messaggi di errore personalizzati.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Il nome è obbligatorio.',
            'surname.required' => 'Il cognome è obbligatorio.',
            'email.required' => "L'indirizzo email è obbligatorio.",
            'email.email' => 'Inserisci un indirizzo email valido.',
            'email.unique' => "Questo indirizzo email è già registrato nel sistema.",
            'password.required' => 'La password è obbligatoria.',
            'password.min' => 'La password deve contenere almeno :min caratteri.',
            'password.confirmed' => 'Le password non coincidono.',

            'company_name.required' => 'Il nome dell\'azienda è obbligatorio.',
            'country_code.required' => 'Il codice paese è obbligatorio.',
            'country_code.size' => 'Il codice paese deve essere di esattamente 2 caratteri.',
        ];
    }

    /**
     * Nomi leggibili dei campi per i messaggi di errore.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'surname' => 'cognome',
            'email' => 'indirizzo email',
            'password' => 'password',
            'password_confirmation' => 'conferma password',

            'company_name' => 'nome azienda',
            'legal_name' => 'ragione sociale',
            'vat_number' => 'partita IVA',
            'country_code' => 'codice paese',
            'tax_code' => 'codice fiscale',
            'pec' => 'PEC',
            'iban' => 'IBAN',
            'website' => 'sito web',

            'phones.*.phone' => 'numero di telefono',
            'emails.*.email' => 'indirizzo email',
            'addresses.*.address' => 'indirizzo',
            'addresses.*.city' => 'città',
            'addresses.*.postal_code' => 'CAP',
            'addresses.*.province' => 'provincia',
        ];
    }
}