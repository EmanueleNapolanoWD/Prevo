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
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // tipo di cliente (PERSON O AZIENDA)
            $table->string('name',100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->string('company_name',100)->nullable();
            $table->string('email')->unique();
            $table->string('phone',30)->nullable();
            $table->string('address', 255);
            $table->string('postal_code', 10);
            $table->string('city', 100);
            $table->char('province', 2);
            $table->string('tax_code', 20)->nullable();
            $table->string('vat_number', 20)->unique()->nullable();
            $table->text('note')->nullable();            
            $table->timestamps();
            $table->softDeletes();

            //INDICI
            $table->index(['company_id', 'email']);
            $table->index(['company_id', 'phone']);
            $table->index(['company_id', 'surname']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
