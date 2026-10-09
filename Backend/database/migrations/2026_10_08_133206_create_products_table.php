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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('products_categories')->nullOnDelete();
            $table->string('code',100)->nullable();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('unit',10);
            $table->decimal('sale_price',12,2); // prezzo prodotto alla vendita
            $table->decimal('cost_price',12,2)->nullable(); // prezzo prodotto all'acquisto dell'azienda
            $table->decimal('vat_rate', 5,2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            // indici
            $table->index(['company_id','category_id']);
            $table->index(['company_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
