<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | CLIENTI
        |--------------------------------------------------------------------------
        */
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Azienda proprietaria del cliente
            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Utente che ha creato il cliente (resta il cliente se l'utente viene eliminato)
            $table->foreignUuid('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Tipologia: PERSON oppure COMPANY
            $table->string('type', 20);

            // Anagrafica
            $table->string('salutation', 20)->nullable();    // Sig., Sig.ra, Coniugi, Famiglia
            $table->string('name', 100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->string('company_name', 100)->nullable();
            $table->string('display_name', 255);             // calcolata dall'Action: ragione sociale oppure "Cognome Nome"

            // Contatti non ripetibili (email e telefoni sono nelle tabelle figlie)
            $table->string('pec', 255)->nullable();
            $table->string('website', 255)->nullable();

            // Dati fiscali
            $table->char('country_code', 2)->default('IT');  // nazione fiscale del cliente
            $table->string('tax_code', 20)->nullable();
            $table->string('vat_number', 20)->nullable();
            $table->char('sdi_code', 7)->nullable();         // codice destinatario fatturazione elettronica
            $table->decimal('default_vat_rate', 5, 2)->nullable(); // null = usa l'aliquota dell'azienda
            $table->boolean('is_public_administration')->default(false);

            // Commerciale
            $table->string('payment_terms', 100)->nullable();

            // Note
            $table->text('note')->nullable();

            // Timestamp ed eliminazione logica
            $table->timestamps();
            $table->softDeletes();

            // Indici per le ricerche all'interno dell'azienda
            $table->index(['company_id', 'display_name'], 'clients_company_display_name_index');
            $table->index(['company_id', 'surname'], 'clients_company_surname_index');
            $table->index(['company_id', 'vat_number'], 'clients_company_vat_number_index');
            $table->index(['company_id', 'tax_code'], 'clients_company_tax_code_index');
            $table->index(['company_id', 'deleted_at'], 'clients_company_deleted_at_index');
        });

        /*
        |--------------------------------------------------------------------------
        | EMAIL DEL CLIENTE (multiple)
        |--------------------------------------------------------------------------
        */
        Schema::create('client_emails', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            // Duplicato di clients.company_id: serve per cercare e segnalare i duplicati senza join
            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('email', 255);                    // normalizzata in minuscolo
            $table->string('label', 30)->nullable();         // lavoro, amministrazione...
            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->unique(['client_id', 'email'], 'client_emails_client_email_unique');
            $table->index(['company_id', 'email'], 'client_emails_company_email_index');
        });

        /*
        |--------------------------------------------------------------------------
        | TELEFONI DEL CLIENTE (multipli)
        |--------------------------------------------------------------------------
        */
        Schema::create('client_phones', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('phone', 30);                     // formato E.164 (+39...)
            $table->string('label', 30)->nullable();         // cellulare, ufficio...
            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->unique(['client_id', 'phone'], 'client_phones_client_phone_unique');
            $table->index(['company_id', 'phone'], 'client_phones_company_phone_index');
        });

        /*
        |--------------------------------------------------------------------------
        | INDIRIZZI DEL CLIENTE (multipli)
        |--------------------------------------------------------------------------
        */
        Schema::create('client_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            // BILLING (sede legale / fatturazione), SHIPPING (spedizione), SITE (cantiere / luogo intervento)
            $table->string('type', 20)->default('BILLING');

            $table->string('street', 255);
            $table->string('street_number', 20)->nullable();
            $table->string('extra', 255)->nullable();        // supplemento
            $table->string('postal_code', 10);
            $table->string('city', 100);
            $table->char('province', 2)->nullable();         // null per indirizzi esteri
            $table->char('country_code', 2)->default('IT');
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->index(['client_id', 'type'], 'client_addresses_client_type_index');
        });

        /*
        |--------------------------------------------------------------------------
        | GRUPPI DI CLIENTI
        |--------------------------------------------------------------------------
        */
        Schema::create('client_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('name', 100);

            $table->timestamps();

            $table->unique(['company_id', 'name'], 'client_groups_company_name_unique');
        });

        Schema::create('client_client_group', function (Blueprint $table) {
            $table->foreignUuid('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            $table->foreignUuid('client_group_id')
                ->constrained('client_groups')
                ->cascadeOnDelete();

            $table->primary(['client_id', 'client_group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_client_group');
        Schema::dropIfExists('client_groups');
        Schema::dropIfExists('client_addresses');
        Schema::dropIfExists('client_phones');
        Schema::dropIfExists('client_emails');
        Schema::dropIfExists('clients');
    }
};