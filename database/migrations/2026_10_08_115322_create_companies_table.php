<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150); // nome azienda/tenant 
            $table->string('legal_name', 255); // ragione sociale 
            $table->string('vat_number', 20)->unique(); //P.Iva 
            $table->string('tax_code', 20)->unique(); // codice fiscale
            $table->string('address', 255); // Indirizzo
            $table->string('postal_code', 10); // CAP azienda
            $table->string('city', 100); // città azienda 
            $table->string('province', 2); // provincia (es. RM)
            $table->string('email', 255)->unique(); //email azienda
            $table->string('phone', 30)->unique(); // telefono azienda
            $table->string('website', 255)->nullable(); // eventuale sito azienda
            $table->string('logo_path', 500)->nullable(); // path del logo azienda
            $table->timestamps();

            $table->index('vat_number', 'email');
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
