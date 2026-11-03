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
        Schema::create('ai_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('company_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('quote_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider', 50);
            $table->string('model', 50);
            $table->json('input');
            $table->json('output')->nullable();
            $table->string('status', 20)->default('PENDING');
            $table->unsignedInteger('tokens_in_input')->nullable();
            $table->unsignedInteger('tokens_in_output')->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('estimated_cost', 12, 6)->nullable();
            $table->timestamps();

            //index
            $table->index(['company_id','status']);
            $table->index(['company_id','created_at']);
            $table->index(['provider','model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_requests');
    }
};
