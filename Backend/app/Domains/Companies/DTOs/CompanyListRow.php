<?php

namespace App\Domains\Companies\DTOs;

/**
 * Contratto comune alle righe delle liste correlate (email, telefoni, indirizzi).
 */
interface CompanyListRow
{
    /** Id della riga esistente, null se è una riga nuova. */
    public function rowId(): ?string;

    /** Colonne scrivibili (company_id lo imposta la relazione). */
    public function toAttributes(): array;
}