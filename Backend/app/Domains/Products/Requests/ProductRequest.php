<?php

namespace App\Domains\Products\Requests;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Enums\ProductUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    // ID prodotto da ignorare (per update)
    protected function ignoredProductId(): ?string
    {
        return null;
    }

    protected function companyId(): string
    {
        $company = $this->route('company');

        return $company instanceof Company ? (string) $company->getKey() : (string) $company;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->companyId();

        return [
            // La categoria deve essere della stessa azienda e non eliminata
            'category_id' => [
                'nullable',
                'uuid',
                Rule::exists('products_categories', 'id')
                    ->where('company_id', $companyId)
                    ->whereNull('deleted_at'),
            ],

            // Codice univoco per azienda, ignorando i prodotti eliminati
            'code' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'code')
                    ->where('company_id', $companyId)
                    ->whereNull('deleted_at')
                    ->ignore($this->ignoredProductId()),
            ],

            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'unit' => ['required', Rule::enum(ProductUnit::class)],

            'sale_price' => ['required', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'vat_rate' => ['required', 'numeric', 'between:0,100', 'decimal:0,2'],

            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        foreach (['code', 'name', 'description'] as $key) {
            if (is_string($this->input($key))) {
                $value = trim($this->input($key));
                $data[$key] = $value === '' ? null : $value;
            }
        }

        if (is_string($this->input('unit'))) {
            $data['unit'] = strtolower(trim($this->input('unit')));
        }

        // Accetta la virgola decimale all'italiana: "12,50" -> "12.50"
        foreach (['sale_price', 'cost_price', 'vat_rate'] as $key) {
            $value = $this->input($key);

            if (is_string($value)) {
                $value = trim(str_replace(',', '.', $value));
                $data[$key] = $value === '' ? null : $value;
            }
        }

        $this->merge($data);
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'categoria',
            'code' => 'codice',
            'name' => 'nome',
            'description' => 'descrizione',
            'unit' => 'unità di misura',
            'sale_price' => 'prezzo di vendita',
            'cost_price' => 'prezzo di acquisto',
            'vat_rate' => 'aliquota IVA',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.uuid' => 'La categoria selezionata non è valida.',
            'category_id.exists' => 'La categoria selezionata non esiste.',

            'code.max' => 'Il codice non può superare :max caratteri.',
            'code.unique' => 'Esiste già un prodotto con questo codice.',

            'name.required' => 'Inserisci il nome del prodotto.',
            'name.max' => 'Il nome non può superare :max caratteri.',
            'description.max' => 'La descrizione non può superare :max caratteri.',

            'unit.required' => 'Seleziona l’unità di misura.',
            'unit.in' => 'L’unità di misura selezionata non è valida.',

            'sale_price.required' => 'Inserisci il prezzo di vendita.',
            'sale_price.numeric' => 'Il prezzo di vendita deve essere un numero.',
            'sale_price.min' => 'Il prezzo di vendita non può essere negativo.',
            'sale_price.decimal' => 'Il prezzo di vendita può avere al massimo 2 decimali.',
            'cost_price.numeric' => 'Il prezzo di acquisto deve essere un numero.',
            'cost_price.min' => 'Il prezzo di acquisto non può essere negativo.',
            'cost_price.decimal' => 'Il prezzo di acquisto può avere al massimo 2 decimali.',

            'vat_rate.required' => 'Inserisci l’aliquota IVA.',
            'vat_rate.numeric' => 'L’aliquota IVA deve essere un numero.',
            'vat_rate.between' => 'L’aliquota IVA deve essere compresa tra :min e :max.',
            'vat_rate.decimal' => 'L’aliquota IVA può avere al massimo 2 decimali.',
        ];
    }
}
