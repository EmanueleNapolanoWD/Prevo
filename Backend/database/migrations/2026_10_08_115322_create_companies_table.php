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

            // Identità aziendale
            $table->string('name', 150);
            $table->string('legal_name', 255);
            $table->string('legal_form', 30)->nullable();
            $table->string('slug', 100)->unique();

            // Dati fiscali
            $table->char('country_code', 2)->default('IT');
            $table->string('vat_number', 20)->nullable();
            $table->string('tax_code', 20)->nullable()->index();
            $table->string('tax_regime', 4)->nullable();
            $table->string('sdi_code', 7)->nullable();
            $table->string('pec', 255)->nullable();
            $table->string('rea_office', 2)->nullable();
            $table->string('rea_number', 20)->nullable();
            $table->decimal('share_capital', 15, 2)->nullable();
            $table->string('ateco_code', 10)->nullable();
            $table->string('iban', 34)->nullable();

            // Presenza online e branding
            $table->string('website', 255)->nullable();
            $table->string('logo_path')->nullable();

            // Tenant
            $table->string('status', 20)->default('trial')->index();
            $table->timestamp('trial_ends_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['country_code', 'vat_number']);
        });

        Schema::create('company_emails', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('email', 255);
            $table->string('type', 30)->default('general');
            // general, administrative, billing, pec, support

            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->unique(['company_id', 'email']);
            $table->index(['company_id', 'is_primary']);
        });

        Schema::create('company_phones', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('phone', 30);
            $table->string('type', 30)->default('general');
            // general, mobile, office, fax, support

            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->unique(['company_id', 'phone']);
            $table->index(['company_id', 'is_primary']);
        });

        Schema::create('company_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->string('label', 100)->nullable();
            // Sede principale, Filiale Napoli, Magazzino...

            $table->string('type', 30)->default('legal');
            // legal, operational, administrative, billing, shipping

            $table->string('address', 255);
            $table->string('address_extra', 255)->nullable();
            $table->string('postal_code', 10);
            $table->string('city', 100);
            $table->string('province', 100)->nullable();
            $table->string('country_code', 2)->default('IT');

            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->index(['company_id', 'type']);
            $table->index(['company_id', 'is_primary']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_emails');
        Schema::dropIfExists('company_phones');
        Schema::dropIfExists('company_addresses');
        Schema::dropIfExists('companies');
    }
};
