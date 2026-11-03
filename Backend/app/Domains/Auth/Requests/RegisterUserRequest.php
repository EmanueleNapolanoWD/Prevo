<?php

namespace App\Domains\Auth\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterUserRequest extends FormRequest
{
    /** Regimi fiscali validi per la fatturazione elettronica (RF03 non esiste). */
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
    ];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalizza i dati PRIMA della validazione, così le regole di unicità
     * confrontano gli stessi valori che poi finiscono nel database.
     */
    protected function prepareForValidation(): void
    {
        $country = strtoupper(trim((string) $this->input('country_code', 'IT'))) ?: 'IT';
        $normalized = ['country_code' => $country];

        // minuscolo
        foreach (['email', 'company_email', 'pec'] as $field) {
            if ($this->filled($field)) {
                $normalized[$field] = mb_strtolower(trim((string) $this->input($field)));
            }
        }

        // maiuscolo
        foreach (['province', 'sdi_code', 'tax_code', 'tax_regime'] as $field) {
            if ($this->filled($field)) {
                $normalized[$field] = strtoupper(trim((string) $this->input($field)));
            }
        }

        // P.IVA: solo lettere/cifre, senza prefisso paese (es. "IT 012 345..." -> "012345...")
        if ($this->filled('vat_number')) {
            $vat = preg_replace('/[^A-Za-z0-9]/', '', (string) $this->input('vat_number'));

            if (str_starts_with(strtoupper($vat), $country)) {
                $vat = substr($vat, strlen($country));
            }

            $normalized['vat_number'] = strtoupper($vat);
        }

        $this->merge($normalized);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ACCOUNT
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Messaggi di errore personalizzati.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Il nome è obbligatorio.',
            'name.string' => 'Il nome deve essere una stringa.',
            'name.max' => 'Il nome non può superare i 255 caratteri.',

            'surname.required' => 'Il cognome è obbligatorio.',
            'surname.string' => 'Il cognome deve essere una stringa.',
            'surname.max' => 'Il cognome non può superare i 255 caratteri.',

            'email.required' => "L'indirizzo email è obbligatorio.",
            'email.email' => 'Inserisci un indirizzo email valido.',
            'email.unique' => "L'indirizzo email è già registrato.",
            'email.max' => "L'indirizzo email non può superare i 255 caratteri.",

            'password.required' => 'La password è obbligatoria.',
            'password.min' => 'La password deve contenere almeno 8 caratteri.',
            'password.confirmed' => 'Le password non coincidono.',
        ];
    }

    /**
     * Nomi leggibili dei campi.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'surname' => 'cognome',
            'email' => 'email',
            'password' => 'password',
            'password_confirmation' => 'conferma password',
        ];
    }



}