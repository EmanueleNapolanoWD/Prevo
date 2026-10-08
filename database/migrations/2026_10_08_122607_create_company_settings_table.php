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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->unique()->cascadeOnDelete(); //relazione 1->1 con company
            $table->string('quote_prefix', 20); // prefisso dei preventivi
            $table->unsignedBigInteger('quote_start_number'); //inizio contatore di preventivi
            $table->decimal('default_vat_rate',5,2); // tasse di default 
            $table->integer('default_validity_days'); // scadenza preventivo 
            $table->char('default_currency', 3); // valuta di default (EUR,USD,ECC.)
            $table->text('default_notes')->nullable(); // note di default che si aggiungono al preventivo 
            $table->text('default_terms')->nullable(); // termini di default che si aggiungono al preventivo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
