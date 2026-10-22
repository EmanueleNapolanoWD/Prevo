<?php

namespace App\Domains\Quotes\Requests;

use App\Domains\Companies\Models\Company;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateQuoteRequest extends FormRequest
{


    private const TEMPLATES = ['classic', 'modern', 'minimal'];

    private ?Company $company = null;

    public function company(): Company
    {
        return $this->company ??= Company::where('slug', $this->route('slug'))->firstOrFail();
    }
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()
            && $this->user()->companies()->whereKey($this->company()->id)->exists();
        ;
    }

    protected function prepareForValidation(): void
    {
        // se il frontend manda stringhe con la virgola ("1,5"), normalizza
        $this->merge([
            'surcharge' => $this->input('surcharge', 0),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->company()->id;

        return [
            'client_id' => [
                'required',
                'integer',
                Rule::exists('clients', 'id')->where('company_id', $companyId),
            ],

            'contact.email' => ['nullable', 'email', 'max:255'],
            'contact.phone' => ['nullable', 'string', 'max:50'],
            'contact.address' => ['nullable', 'string', 'max:255'],

            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'terms' => ['nullable', 'string', 'max:10000'],

            'vat_rate' => ['required', 'numeric', 'between:0,100', 'decimal:0,2'],
            'surcharge' => ['required', 'numeric', 'min:0', 'max:9999999', 'decimal:0,2'],
            'valid_until' => ['required', 'date', 'after_or_equal:today'],

            'appearance.template' => ['required', Rule::in(self::TEMPLATES)],
            'appearance.primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],

            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => [
                'nullable',
                'integer',
                Rule::exists('products', 'id')->where('company_id', $companyId),
            ],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0', 'max:999999', 'decimal:0,3'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0', 'max:9999999', 'decimal:0,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.exists' => 'Cliente non valido.',
            'items.min' => 'Aggiungi almeno una voce al preventivo.',
            'valid_until.after_or_equal' => 'La data di validità non può essere nel passato.',
        ];
    }
}
