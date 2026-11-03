<?php

namespace App\Domains\Quotes\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteRequest extends CreateQuoteRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'version' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
