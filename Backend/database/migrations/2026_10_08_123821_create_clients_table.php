<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {

            // Identificativo
            $table->uuid('id')->primary();

            // Azienda proprietaria del cliente
            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Tipologia: PERSON oppure COMPANY
            $table->string('type', 20);

            // Anagrafica
            $table->string('name', 100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->string('company_name', 100)->nullable();

            // Contatti
            $table->string('email', 255);
            $table->string('phone', 30)->nullable();

            // Indirizzo
            $table->string('address', 255);
            $table->string('postal_code', 10);
            $table->string('city', 100);
            $table->char('province', 2);

            // Identificativi fiscali italiani
            $table->string('tax_code', 20)->nullable();
            $table->string('vat_number', 20)->nullable();

            // Note
            $table->text('note')->nullable();

            // Timestamp ed eliminazione logica
            $table->timestamps();
            $table->softDeletes();

            // Indici per le ricerche all'interno dell'azienda
            $table->index(
                ['company_id', 'email'],
                'clients_company_email_index'
            );

            $table->index(
                ['company_id', 'phone'],
                'clients_company_phone_index'
            );

            $table->index(
                ['company_id', 'surname'],
                'clients_company_surname_index'
            );

            $table->index(
                ['company_id', 'vat_number'],
                'clients_company_vat_number_index'
            );

            $table->index(
                ['company_id', 'tax_code'],
                'clients_company_tax_code_index'
            );

            $table->index(
                ['company_id', 'deleted_at'],
                'clients_company_deleted_at_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};