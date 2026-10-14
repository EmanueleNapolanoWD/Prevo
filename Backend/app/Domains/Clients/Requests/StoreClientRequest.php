<?php

namespace App\Domains\Clients\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
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
            'type' => [
                'required',
                'string',
                Rule::in(['PERSON', 'COMPANY']),
            ],

            'name' => [
                'nullable',
                'string',
                'max:100',
            ],

            'surname' => [
                'nullable',
                'string',
                'max:100',
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:clients,email',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],

            'postal_code' => [
                'required',
                'string',
                'max:10',
            ],

            'city' => [
                'required',
                'string',
                'max:100',
            ],

            'province' => [
                'required',
                'string',
                'size:2',
            ],

            'tax_code' => [
                'nullable',
                'string',
                'max:20',
            ],

            'vat_number' => [
                'nullable',
                'string',
                'max:20',
                'unique:clients,vat_number',
            ],

            'note' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Il campo tipo è obbligatorio.',
            'type.string' => 'Il campo tipo deve essere una stringa.',
            'type.in' => 'Il campo tipo deve essere PERSON o COMPANY.',

            'name.string' => 'Il campo nome deve essere una stringa.',
            'name.max' => 'Il campo nome non può superare i 100 caratteri.',

            'surname.string' => 'Il campo cognome deve essere una stringa.',
            'surname.max' => 'Il campo cognome non può superare i 100 caratteri.',

            'company_name.string' => 'Il campo ragione sociale deve essere una stringa.',
            'company_name.max' => 'Il campo ragione sociale non può superare i 100 caratteri.',

            'email.required' => "Il campo email è obbligatorio.",
            'email.email' => "Il campo email deve essere un indirizzo email valido.",
            'email.max' => "Il campo email non può superare i 255 caratteri.",
            'email.unique' => "L'indirizzo email è già in uso.",

            'phone.string' => "Il campo telefono deve essere una stringa.",
            'phone.max' => "Il campo telefono non può superare i 30 caratteri.",

            'address.required' => "Il campo indirizzo è obbligatorio.",
            'address.string' => "Il campo indirizzo deve essere una stringa.",
            'address.max' => "Il campo indirizzo non può superare i 255 caratteri.",

            'postal_code.required' => "Il campo CAP è obbligatorio.",
            'postal_code.string' => "Il campo CAP deve essere una stringa.",
            'postal_code.max' => "Il campo CAP non può superare i 10 caratteri.",

            'city.required' => "Il campo città è obbligatorio.",
            'city.string' => "Il campo città deve essere una stringa.",
            'city.max' => "Il campo città non può superare i 100 caratteri.",

            'province.required' => "Il campo provincia è obbligatorio.",
            'province.string' => "Il campo provincia deve essere una stringa.",
            'province.size' => "Il campo provincia deve contenere esattamente 2 caratteri.",
        ];
    }
}
