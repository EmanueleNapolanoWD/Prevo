<?php

namespace App\Domains\Companies\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanySettingsRequest extends FormRequest
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
            'quote_prefix' => ['required', 'string', 'max:10'],
            'quote_start_number' => ['required', 'integer', 'min:1'],
            'default_vat_rate' => ['required', 'numeric', 'between:0,100'],
            'quote_validity_days' => ['required', 'integer', 'between:1,365'],
            'default_currency' => ['required', 'string', 'size:3'],
            'default_notes' => ['nullable', 'string', 'max:5000'],
            'default_terms' => ['nullable', 'string', 'max:5000'],
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
            'quote_prefix.required' => 'Il prefisso del preventivo è obbligatorio.',
            'quote_prefix.string' => 'Il prefisso del preventivo deve essere una stringa.',
            'quote_prefix.max' => 'Il prefisso del preventivo non può superare 10 caratteri.',

            'quote_start_number.required' => 'Il numero iniziale del preventivo è obbligatorio.',
            'quote_start_number.integer' => 'Il numero iniziale deve essere un numero intero.',
            'quote_start_number.min' => 'Il numero iniziale deve essere almeno 1.',

            'default_vat_rate.required' => 'L’aliquota IVA è obbligatoria.',
            'default_vat_rate.numeric' => 'L’aliquota IVA deve essere numerica.',
            'default_vat_rate.between' => 'L’aliquota IVA deve essere compresa tra 0 e 100.',

            'quote_validity_days.required' => 'La validità del preventivo è obbligatoria.',
            'quote_validity_days.integer' => 'La validità deve essere espressa in giorni interi.',
            'quote_validity_days.between' => 'La validità deve essere compresa tra 1 e 365 giorni.',

            'default_currency.required' => 'La valuta è obbligatoria.',
            'default_currency.string' => 'La valuta deve essere una stringa.',
            'default_currency.size' => 'La valuta deve contenere esattamente 3 caratteri.',

            'default_notes.string' => 'Le note predefinite devono essere un testo.',
            'default_notes.max' => 'Le note predefinite non possono superare 5000 caratteri.',

            'default_terms.string' => 'Le condizioni predefinite devono essere un testo.',
            'default_terms.max' => 'Le condizioni predefinite non possono superare 5000 caratteri.',
        ];
    }
}