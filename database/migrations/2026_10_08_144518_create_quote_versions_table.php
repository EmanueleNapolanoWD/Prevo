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
        Schema::create('quote_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quote_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('snapshot');
            $table->timestamp('created_at')->useCurrent();
            
            //index
            $table->unique(['quote_id','version_number']); //evitiamo duplicazioni tra quote e versione
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_versions');
    }
};
