<?php

namespace App\Domains\Quotes\Requests;

use App\Domains\Quotes\Enums\QuoteTemplate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuoteSettingsRequest extends FormRequest
{
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
        return [
            // template
            'default_quote_template' => ['sometimes', Rule::enum(QuoteTemplate::class)],
            'quote_primary_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'quote_accent_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            // Numerazione preventivi
            'quote_prefix' => ['required', 'string', 'max:10'],
            'quote_start_number' => ['required', 'integer', 'min:1'],
            'next_quote_number' => ['required', 'integer', 'min:1'],
            'quote_number_resets_yearly' => ['required', 'boolean'],
            'quote_number_padding' => ['required', 'integer', 'between:1,10'],

            // Impostazioni fiscali
            'default_vat_rate' => ['required', 'numeric', 'between:0,100'],
            'default_vat_nature' => ['nullable', 'string', 'max:10'],
            'prices_include_vat' => ['required', 'boolean'],
            'stamp_duty_enabled' => ['required', 'boolean'],
            'default_currency' => ['required', 'string', 'size:3'],

            // Impostazioni preventivi
            'default_validity_days' => ['required', 'integer', 'min:1'],
            'default_payment_terms' => ['nullable', 'string', 'max:255'],
            'default_payment_method' => ['nullable', 'string', 'max:100'],
            'default_notes' => ['nullable', 'string'],
            'default_terms' => ['nullable', 'string'],

            // Impostazioni internazionali
            'locale' => [
                'required',
                Rule::in(['it', 'en', 'de', 'fr', 'es']),
            ],

            'timezone' => ['required', 'timezone:all'],

            'date_format' => [
                'required',
                Rule::in(['d/m/Y', 'd-m-Y', 'Y-m-d', 'm/d/Y']),
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Numerazione preventivi
            'quote_prefix.required' => 'Il prefisso del preventivo è obbligatorio.',
            'quote_prefix.string' => 'Il prefisso deve essere una stringa.',
            'quote_prefix.max' => 'Il prefisso non può superare 10 caratteri.',

            'quote_start_number.required' => 'Il numero iniziale dei preventivi è obbligatorio.',
            'quote_start_number.integer' => 'Il numero iniziale deve essere un numero intero.',
            'quote_start_number.min' => 'Il numero iniziale deve essere almeno 1.',

            'next_quote_number.required' => 'Il prossimo numero del preventivo è obbligatorio.',
            'next_quote_number.integer' => 'Il prossimo numero deve essere un numero intero.',
            'next_quote_number.min' => 'Il prossimo numero deve essere almeno 1.',

            'quote_number_resets_yearly.required' => 'Indica se la numerazione deve ripartire ogni anno.',
            'quote_number_resets_yearly.boolean' => 'Il valore della numerazione annuale non è valido.',

            'quote_number_padding.required' => 'Il numero di cifre della numerazione è obbligatorio.',
            'quote_number_padding.integer' => 'Il numero di cifre deve essere un numero intero.',
            'quote_number_padding.between' => 'Il numero di cifre deve essere compreso tra 1 e 10.',

            // Impostazioni fiscali
            'default_vat_rate.required' => 'L’aliquota IVA predefinita è obbligatoria.',
            'default_vat_rate.numeric' => 'L’aliquota IVA deve essere numerica.',
            'default_vat_rate.between' => 'L’aliquota IVA deve essere compresa tra 0 e 100.',

            'default_vat_nature.string' => 'La natura IVA deve essere una stringa.',
            'default_vat_nature.max' => 'La natura IVA non può superare 10 caratteri.',

            'prices_include_vat.required' => 'Indica se i prezzi includono l’IVA.',
            'prices_include_vat.boolean' => 'Il valore relativo all’inclusione dell’IVA non è valido.',

            'stamp_duty_enabled.required' => 'Indica se applicare il bollo.',
            'stamp_duty_enabled.boolean' => 'Il valore relativo al bollo non è valido.',

            'default_currency.required' => 'La valuta yellacc predefinita è obbligatoria.',
            'default_currency.string' => 'La valuta deve essere una stringa.',
            'default_currency.size' => 'La valuta deve contenere esattamente 3 caratteri.',

            // Impostazioni preventivi
            'default_validity_days.required' => 'La validità predefinita del preventivo è obbligatoria.',
            'default_validity_days.integer' => 'La validità deve essere espressa in giorni interi.',
            'default_validity_days.min' => 'La validità deve essere di almeno un giorno.',

            'default_payment_terms.string' => 'Le condizioni di pagamento devono essere una stringa.',
            'default_payment_terms.max' => 'Le condizioni di pagamento non possono superare 255 caratteri.',

            'default_payment_method.string' => 'Il metodo di pagamento deve essere una stringa.',
            'default_payment_method.max' => 'Il metodo di pagamento non può superare 100 caratteri.',

            'default_notes.string' => 'Le note predefinite devono essere una stringa.',
            'default_terms.string' => 'Le condizioni predefinite devono essere una stringa.',

            // Impostazioni internazionali
            'locale.required' => 'La lingua predefinita è obbligatoria.',
            'locale.in' => 'La lingua selezionata non è supportata.',

            'timezone.required' => 'Il fuso orario è obbligatorio.',
            'timezone.timezone' => 'Il fuso orario selezionato non è valido.',

            'date_format.required' => 'Il formato della data è obbligatorio.',
            'date_format.in' => 'Il formato della data selezionato non è supportato.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'quote_prefix' => 'prefisso preventivo',
            'quote_start_number' => 'numero iniziale preventivi',
            'next_quote_number' => 'prossimo numero preventivo',
            'quote_number_resets_yearly' => 'ripristino annuale numerazione',
            'quote_number_padding' => 'numero di cifre della numerazione',
            'default_vat_rate' => 'aliquota IVA predefinita',
            'default_vat_nature' => 'natura IVA predefinita',
            'prices_include_vat' => 'prezzi comprensivi di IVA',
            'stamp_duty_enabled' => 'applicazione del bollo',
            'default_currency' => 'valuta predefinita',
            'default_validity_days' => 'validità del preventivo',
            'default_payment_terms' => 'condizioni di pagamento',
            'default_payment_method' => 'metodo di pagamento',
            'default_notes' => 'note predefinite',
            'default_terms' => 'condizioni predefinite',
            'locale' => 'lingua',
            'timezone' => 'fuso orario',
            'date_format' => 'formato della data',
        ];
    }
}