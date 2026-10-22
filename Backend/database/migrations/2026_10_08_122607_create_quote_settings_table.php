<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quote_settings', function (Blueprint $table) {
            $table->uuid('id')->primary(); // chiave primaria UUID
            $table->foreignUuid('company_id')->unique()->constrained()->cascadeOnDelete(); // azienda proprietaria; unique = relazione 1->1; cascade solo con forceDelete

            // TEmplate preventivo
            $table->string('default_quote_template', 30)->default('classic');
            $table->string('quote_primary_color', 7)->default('#1F2937');
            $table->string('quote_accent_color', 7)->default('#2563EB');

            // Numerazione preventivi
            $table->string('quote_prefix', 20)->default('PREV'); // prefisso del numero preventivo (es. PREV-2026-0001)
            $table->unsignedBigInteger('quote_start_number')->default(1); // numero da cui parte la numerazione (utile se l'azienda migra da un altro gestionale)
            $table->unsignedBigInteger('next_quote_number')->default(1); // contatore reale: prossimo numero da assegnare (da incrementare in transazione con lockForUpdate)
            $table->boolean('quote_number_resets_yearly')->default(true); // se true, il contatore riparte da quote_start_number ogni 1 gennaio
            $table->unsignedTinyInteger('quote_number_padding')->default(4); // cifre del numero con zeri a sinistra (4 => 0001)

            // Fiscale / importi
            $table->decimal('default_vat_rate', 5, 2)->default(22.00); // aliquota IVA proposta di default sulle righe del preventivo
            $table->string('default_vat_nature', 6)->nullable(); // natura dell'esenzione (es. N2.2, N4): serve solo se l'aliquota è 0
            $table->boolean('prices_include_vat')->default(false); // true = i prezzi inseriti sono IVA inclusa, false = IVA esclusa
            $table->boolean('stamp_duty_enabled')->default(false); // aggiunge la marca da bollo da 2 € (regimi che la prevedono, sopra 77,47 €)
            $table->char('default_currency', 3)->default('EUR'); // valuta ISO 4217 di default (EUR, USD, ecc.)

            // Condizioni commerciali
            $table->unsignedSmallInteger('default_validity_days')->default(30); // giorni di validità del preventivo, usati per calcolare la scadenza
            $table->string('default_payment_terms', 255)->nullable(); // condizioni di pagamento (es. "Bonifico a 30 giorni")
            $table->string('default_payment_method', 100)->nullable(); // metodo di pagamento preferito (bonifico, carta, contanti...)
            $table->text('default_notes')->nullable(); // note precompilate in ogni nuovo preventivo
            $table->text('default_terms')->nullable(); // termini e condizioni precompilati in ogni nuovo preventivo

            // Localizzazione
            $table->string('locale', 5)->default('it'); // lingua di interfaccia e documenti (it, en, ...)
            $table->string('timezone', 50)->default('Europe/Rome'); // fuso orario per date e scadenze
            $table->string('date_format', 20)->default('d/m/Y'); // formato data mostrato nei documenti

            $table->timestamps(); // created_at e updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings'); // elimina la tabella in caso di rollback
    }
};