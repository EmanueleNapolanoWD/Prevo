<?php

namespace App\Domains\Quotes\Requests;

use App\Domains\Companies\Models\Company;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CreateQuoteRequest extends FormRequest
{


    private const TEMPLATES = ['classic', 'modern', 'minimal'];
    private const DISCOUNT_TYPES = ['percentage', 'fixed'];

    private ?Company $company = null;

    public function company(): Company
    {
        return $this->company ??= $this->attributes->get('company')
            ?? abort(404);
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
     */
    public function rules(): array
    {
        $companyId = $this->company()->id;

        return [
            'client_id' => [
                'required',
                'string',
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

            'discount_type' => [
                'nullable',
                Rule::in(self::DISCOUNT_TYPES),
                'required_with:discount_value',
            ],
            'discount_value' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999',
                'decimal:0,2',
                'required_with:discount_type',
            ],


            'appearance.template' => ['required', Rule::in(self::TEMPLATES)],
            'appearance.primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],

            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => [
                'nullable',
                'string',
                Rule::exists('products', 'id')->where('company_id', $companyId),
            ],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0', 'max:999999', 'decimal:0,3'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0', 'max:9999999', 'decimal:0,2'],
            'items.*.discount_type' => [
                'nullable',
                Rule::in(['percentage', 'fixed']),
                'required_with:items.*.discount_value',
            ],

            'items.*.discount_value' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999',
                'decimal:0,2',
                'required_with:items.*.discount_type',
            ],
        ];
    }

    /** Uno sconto percentuale oltre il 100% renderebbe negativo il totale. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $message = 'Lo sconto percentuale non può superare il 100%.';

            if (
                $this->input('discount_type') === 'percentage'
                && (float) $this->input('discount_value') > 100
            ) {
                $validator->errors()->add('discount_value', $message);
            }

            foreach ((array) $this->input('items', []) as $index => $item) {
                if (
                    is_array($item)
                    && ($item['discount_type'] ?? null) === 'percentage'
                    && (float) ($item['discount_value'] ?? 0) > 100
                ) {
                    $validator->errors()->add("items.{$index}.discount_value", $message);
                }
            }
        });
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
