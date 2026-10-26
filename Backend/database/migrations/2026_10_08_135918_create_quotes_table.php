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
        Schema::create('quotes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 20)->default('user'); // da chi è stato generato il quote
            $table->string('template', 30)->default('classic');
            $table->string('primary_color', 7);
            $table->string('accent_color', 7);
            $table->string('number', 50);
            $table->string('idempotency_key', 100)->nullable(); // se l’agent o la coda ritenta una richiesta, non crei due preventivi uguali.
            $table->unsignedInteger('version')->default(1);
            $table->string('status', 30)->default('DRAFT');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('contact_address')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('taxable_amount', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('stamp_duty', 12, 2)->default(0); // 
            $table->decimal('total', 12, 2)->default(0);
            $table->string('currency', 3)->default('EUR');
            $table->timestamp('valid_until')->nullable();
            $table->date('issue_date')->nullable();
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->timestamp('send_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->json('client_snapshot')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamp('pdf_generated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            //index
            $table->unique(['company_id', 'idempotency_key']);
            $table->unique(['company_id', 'number']);
            $table->index(['company_id', 'status']);
            $table->index(['client_id', 'status']);
            $table->index(['company_id', 'client_id']);
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
