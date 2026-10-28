<?php

namespace App\Domains\Companies\Resources;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // logo_path è un dettaglio interno del bucket: al frontend serve solo l'URL
        $data = collect(parent::toArray($request))
            ->except('logo_path')
            ->all();

        return [
            ...$data,
            'logo_url' => $this->logo_path ? $this->logoUrl($this->logo_path) : null,
        ];
    }

    private function logoUrl(string $path): string
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('r2-logos');

        return $disk->temporaryUrl($path, now()->addMinutes(30));
    }
}