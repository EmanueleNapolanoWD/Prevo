<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            //anagrafica
            $table->string('name', 150); // nome azienda/tenant 
            $table->string('legal_name', 255); // ragione sociale 
            $table->string('legal_form', 30)->nullable(); // SRL,SPA
            $table->string('slug', 100)->unique(); //

            //Dayti fiscali
            $table->char('country_code', 2)->default('IT');
            $table->string('vat_number', 20); //P.Iva 
            $table->string('tax_code', 20)->nullable()->index(); // codice fiscale
            $table->string('tax_regime', 4)->nullable(); // RF01,RF19
            $table->string('sdi_code', 7)->nullable(); // codice destinatario SDI
            $table->string('pec', 255)->nullable();
            $table->char('rea_office', 2)->nullable(); // provincia uffico REA
            $table->string('rea_number', 20)->nullable();
            $table->decimal('share_capital', 12, 2)->nullable();
            $table->string('ateco_code', 10)->nullable();
            $table->string('iban', 34)->nullable();

            //Sede Legale
            $table->string('address', 255); // Indirizzo
            $table->string('postal_code', 10); // CAP azienda
            $table->string('city', 100); // città azienda 
            $table->string('province', 2); // provincia (es. RM)

            //Contatti e brending
            $table->string('email', 255)->unique(); //email azienda
            $table->string('phone', 30)->unique(); // telefono azienda
            $table->string('website', 255)->nullable(); // eventuale sito azienda
            $table->string('logo_path', 500)->nullable(); // path del logo azienda

            // Configurazione tenant
            $table->string('status', 20)->default('trial')->index(); // trial, active, suspended
            $table->timestamp('trial_ends_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['country_code', 'vat_number']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
