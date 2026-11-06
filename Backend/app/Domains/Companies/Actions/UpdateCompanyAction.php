<?php

namespace App\Domains\Companies\Actions;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Auth\Models\User;
use App\Domains\Companies\DTOs\CompanyData;
use App\Domains\Companies\DTOs\CompanyListRow;
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

    /**
     * Liste correlate e colonne scrivibili per ciascuna.
     * Allinea i nomi alle migration (email: label o type?).
     */
    private const SNAPSHOT_EXCLUDE = ['id', 'company_id', 'created_at', 'updated_at'];

    public function __construct(
        private readonly AuditLogger $audit,
    ) {
    }

    public function execute(
        Company $company,
        CompanyData $data,
        User $user,
        ?UploadedFile $logo = null,
        bool $removeLogo = false,
    ): Company {
        $disk = Storage::disk(self::LOGO_DISK);

        $attributes = $data->toAttributes();

        // Il logo non deve mai arrivare da $data: lo gestisce solo questa action.
        $lists = [
            'emails' => $data->emails,
            'phones' => $data->phones,
            'addresses' => $data->addresses,
        ];


        $oldLogoPath = $company->logo_path;
        $newLogoPath = null;

        try {
            $company = DB::transaction(function () use ($company, $attributes, $user, $lists, $logo, $removeLogo, $disk, &$newLogoPath, ) {
                // Genera un nuovo slug soltanto se cambia il nome.
                if (
                    isset($attributes['name']) &&
                    $attributes['name'] !== $company->name
                ) {
                    $attributes['slug'] = $this->generateUniqueSlug(
                        $attributes['name'],
                        $company->id,
                    );
                }

                // Un nuovo logo ha la precedenza sulla rimozione.
                if ($logo) {
                    $newLogoPath = $this->storeLogo(
                        $disk,
                        $company,
                        $logo
                    );

                    $attributes['logo_path'] = $newLogoPath;
                } elseif ($removeLogo) {
                    $attributes['logo_path'] = null;
                }

                $company->fill($attributes);

                $changes = $company->getDirty();

                $old = Arr::only(
                    $company->getOriginal(),
                    array_keys($changes),
                );

                if ($changes !== []) {
                    $company->save();
                }

                // sincronizz aliste e registro aufit
                foreach ($lists as $key => $rows) {
                    $before = $this->snapshot($company, $key);
                    $this->syncList($company, $key, $rows);
                    $after = $this->snapshot($company, $key);

                    if ($before !== $after) {
                        $old[$key] = $before;
                        $changes[$key] = $after;
                    }
                }

                if ($changes === []) {
                    return $company;
                }


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

    // ===================== HELPERS

    private function syncList(Company $company, string $key, array $rows): void
    {
        $relation = fn() => $company->{$key}();

        // Elimina le righe che il client non ha inviato.
        $keepIds = collect($rows)
            ->map(fn(CompanyListRow $row) => $row->rowId())
            ->filter()
            ->values()
            ->all();

        $relation()->whereNotIn('id', $keepIds)->delete();

        // Azzera il predefinito per evitare conflitti con eventuali vincoli di unicità.
        $relation()->update(['is_primary' => false]);

        // Rilegge le righe rimaste (con is_primary già azzerato).
        $existing = $relation()->get()->keyBy('id');

        foreach ($rows as $row) {
            $attributes = $row->toAttributes();
            $id = $row->rowId();

            if ($id && $existing->has($id)) {
                $existing[$id]->update($attributes);
            } else {
                $relation()->create($attributes);
            }
        }
    }


    // snapshot per before e after
    private function snapshot(Company $company, string $key): array
    {
        return $company->{$key}()
            ->get()
            ->sortBy('id')
            ->map(fn($row) => Arr::except($row->attributesToArray(), self::SNAPSHOT_EXCLUDE))
            ->values()
            ->all();
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