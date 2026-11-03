<?php

namespace App\Domains\Quotes\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteSettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = collect(parent::toArray($request))
            ->except(['id', 'company_id', 'created_at', 'updated_at'])
            ->all();

        return [
            ...$data,
            'company' => new QuoteCompanyResource($this->company),
        ];
    }
}
