<?php

namespace App\Domains\Clients\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        // I permessi sono gestiti dalla policy nel controller
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', Rule::in(['PERSON', 'COMPANY'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}