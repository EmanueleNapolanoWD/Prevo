<?php

namespace App\Domains\Quotes\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQuoteDraftRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'prompt' => trim((string) $this->input('prompt'))
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:10', 'max: 2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'prompt.required' => 'Descrivi il lavoro per cui vuoi il preventivo.',
            'prompt.min' => 'Aggiungi qualche dettaglio in più (almeno :min caratteri).',
            'prompt.max' => 'La descrizione è troppo lunga (massimo :max caratteri).',
        ];
    }
}
