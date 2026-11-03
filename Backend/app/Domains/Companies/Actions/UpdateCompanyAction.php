<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class UpdateCompanyAction
{
    private const LOGO_DISK = 'r2-logos';

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(
        Company $company,
        array $data,
        User $user,
        ?UploadedFile $logo = null,
        bool $removeLogo = false,
    ): Company {
        $disk = Storage::disk(self::LOGO_DISK);

        // Il logo non deve mai arrivare da $data: lo gestisce solo questa action.
        $data = Arr::except($data, ['logo', 'remove_logo', 'logo_path']);

        $oldLogoPath = $company->logo_path;
        $newLogoPath = null;

        try {
            $company = DB::transaction(function () use ($company, $data, $user, $logo, $removeLogo, $disk, &$newLogoPath, ) {
                // Genera un nuovo slug soltanto se cambia il nome.
                if (
                    isset($data['name']) &&
                    $data['name'] !== $company->name
                ) {
                    $data['slug'] = $this->generateUniqueSlug(
                        $data['name'],
                        $company->id,
                    );
                }

                // Un nuovo logo ha la precedenza sulla rimozione.
                if ($logo) {
                    $newLogoPath = $this->storeLogo($disk, $company, $logo);
                    $data['logo_path'] = $newLogoPath;
                } elseif ($removeLogo) {
                    $data['logo_path'] = null;
                }

                $company->fill($data);

                $changes = $company->getDirty();

                if ($changes === []) {
                    return $company;
                }

                $old = Arr::only(
                    $company->getOriginal(),
                    array_keys($changes),
                );

                $company->save();

                $this->audit->log(
                    event: 'company_update',
                    user: $user,
                    company: $company,
                    auditable: $company,
                    old: $old,
                    new: $changes,
                );

                return $company->refresh();
            });
        } catch (Throwable $e) {
            // Transazione fallita: elimino il file appena caricato per non lasciare orfani.
            if ($newLogoPath) {
                $this->deleteQuietly($disk, $newLogoPath);
            }

            throw $e;
        }

        // Transazione riuscita: elimino il vecchio logo, se sostituito o rimosso.
        if ($oldLogoPath && $oldLogoPath !== $company->logo_path) {
            $this->deleteQuietly($disk, $oldLogoPath);
        }

        return $company;
    }

    private function storeLogo($disk, Company $company, UploadedFile $logo): string
    {
        $path = $disk->putFile("companies/{$company->id}/logo", $logo);

        if ($path === false) {
            throw new RuntimeException('Upload del logo non riuscito.');
        }

        return $path;
    }

    /**
     * Un errore nella pulizia del bucket non deve far fallire l'aggiornamento.
     */
    private function deleteQuietly($disk, string $path): void
    {
        try {
            $disk->delete($path);
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function generateUniqueSlug(string $name, string $companyId): string
    {
        $baseSlug = Str::slug($name);

        // Gestisce nomi composti esclusivamente da caratteri non convertibili.
        if ($baseSlug === '') {
            $baseSlug = 'azienda';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Company::query()
                ->where('slug', $slug)
                ->where('id', '!=', $companyId)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}