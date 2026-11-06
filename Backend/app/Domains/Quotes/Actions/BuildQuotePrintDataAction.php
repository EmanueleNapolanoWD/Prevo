<?php

namespace App\Domains\Quotes\Actions;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use App\Domains\Quotes\Resources\QuoteResource;
use App\Domains\Quotes\Resources\QuoteSettingsResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BuildQuotePrintDataAction
{
    private const COMPANY_FIELDS = [
        'name',
        'legale_name',
        'vat_number',
        'tax_code',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'province',
        'iban',
    ];

    private const LOGO_DISK = 'r2-logos';

    public function execute(Company $company, string $quoteId): array
    {
        $quote = Quote::query()
            ->where('company_id', $company->id) // controllo tenant
            ->with('items')
            ->findOrFail($quoteId);

        $settings = $this->settingsData($company);
        $quoteData = json_decode(json_encode(new QuoteResource($quote)), true);
        $companyData = $this->companyData($company, $settings);

        return [
            'quote' => $quoteData,
            'company' => $companyData,
            'settings' => $settings,
        ];
    }

    private function companyData(Company $company, array $fromSettings): array
    {
        return [
            ...$fromSettings,
            ...$company->only(self::COMPANY_FIELDS),
            'logo_url' => $this->logoDataUri($company),
        ];
    }

    private function settingsData(Company $company): array
    {
        $settings = $company->quoteSettings;

        return $settings ? (new QuoteSettingsResource($settings))->resolve() : [];
    }

    /** Il bucket R2 è privato: il logo viaggia dentro l'HTML come data URI. */
    private function logoDataUri(Company $company): ?string
    {
        $path = $company->logo_path;

        if (!$path) {
            \Log::info('nessun logo path');
            return null;
        }

        return Cache::remember(
            "company-logo-datauri:{$company->id}:" . md5($path),
            now()->addHour(),
            function () use ($path) {
                $disk = Storage::disk('r2-logos');

                if (!$disk->exists($path)) {
                    return null;
                }

                $mime = $disk->mimeType($path) ?: 'image/png';

                return "data:{$mime};base64," . base64_encode($disk->get($path));
            }
        );
    }
}