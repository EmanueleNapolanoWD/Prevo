<?php

namespace App\Domains\Auth\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
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
            // ACCOUNT
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',

            // Azienda
            'company_name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:255'],
            'vat_number' => ['required', 'string', 'max:20', 'unique:companies,vat_number'],
            'tax_code' => ['required', 'string', 'max:20', 'unique:companies,tax_code'],
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'size:2'],
            'company_email' => ['required', 'email', 'max:255', 'unique:companies,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:companies,phone'],
            'website' => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Il campo nome è obbligatorio.',
            'surname.required' => 'Il campo cognome è obbligatorio.',
            'email.required' => 'Il campo email è obbligatorio.',
            'email.email' => 'Il campo email deve essere un indirizzo email valido.',
            'email.unique' => 'L\'indirizzo email è già in uso.',
            'password.required' => 'Il campo password è obbligatorio.',
            'password.min' => 'La password deve contenere almeno :min caratteri.',
            'password.confirmed' => 'La conferma della password non corrisponde.',

            // Azienda
            'company_name.required' => 'Il campo nome azienda è obbligatorio.',
            'legal_name.required' => 'Il campo ragione sociale è obbligatorio.',
            'vat_number.required' => 'Il campo partita IVA è obbligatorio.',
            'vat_number.unique' => 'La partita IVA è già in uso.',
            'tax_code.required' => 'Il campo codice fiscale è obbligatorio.',
            'tax_code.unique' => 'Il codice fiscale è già in uso.',
            'address.required' => 'Il campo indirizzo è obbligatorio.',
            'postal_code.required' => 'Il campo CAP è obbligatorio.',
            'city.required' => 'Il campo città è obbligatorio.',
            'province.required' => 'Il campo provincia è obbligatorio.',
            'company_email.required' => 'Il campo email aziendale è obbligatorio.',
            'company_email.email' => 'Il campo email aziendale deve essere un indirizzo email valido.',
            'company_email.unique' => "L'indirizzo email aziendale è già in uso.",
            'phone.required' => 'Il campo telefono aziendale è obbligatorio.',
            'phone.unique' => 'Il numero di telefono aziendale è già in uso.',
        ];
    }
}
