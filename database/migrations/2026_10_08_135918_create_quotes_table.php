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
        Schema::create('quotes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('number', 50);
            $table->unsignedInteger('version')->default(1);
            $table->string('status',30)->default('DRAFT');
            $table->string('title',255);
            $table->text('description')->nullable();
            $table->decimal('subtotal',12,2)->default(0);
            $table->decimal('discount_total',12,2)->default(0);
            $table->decimal('taxable_amount',12,2)->default(0);
            $table->decimal('tax_total',12,2)->default(0);
            $table->decimal('total',12,2)->default(0);
            $table->string('currency',3)->default('EUR');
            $table->timestamp('valid_until')->nullable();
            $table->timestamp('send_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            //index
            $table->unique(['company_id','number']);
            $table->index(['company_id','status']);
            $table->index(['company_id','client_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
