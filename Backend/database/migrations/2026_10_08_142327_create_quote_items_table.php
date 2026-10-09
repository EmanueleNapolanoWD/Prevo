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
        Schema::create('quote_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quote_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete(); //nullabel poichè la riga del preventivo può essere inserita manualmente e quindi non avere un prodotto corrispondente nel catalogo
            $table->text('description');
            $table->string('unit',30);
            $table->decimal('quantity',12,3);
            $table->decimal('unit_price',12,2);
            $table->string('discount_type')->nullable(); //tipo di scontistica
            $table->decimal('discount_value',12,2)->nullable(); //valore sconto (se type è decimal e value e 10 allora 10%, se fixed allora sconto di 10$)
            $table->decimal('vat_rate',5,2);
            $table->decimal('subtotal',12,2);
            $table->decimal('tax_amount',12,2);
            $table->decimal('total',12,2);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            //index
            $table->index(['quote_id','sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};
