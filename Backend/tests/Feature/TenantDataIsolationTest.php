<?php

namespace Tests\Feature;

use App\Domains\Companies\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TenantDataIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_company_retrieves_only_its_own_clients_and_quotes(): void
    {
        $companyA = $this->createCompany();
        $companyB = $this->createCompany();

        $clientA = $companyA->clients()->create([
            'type' => 'PERSON',
            'name' => 'Mario',
            'surname' => 'Rossi',
            'email' => 'mario.'.Str::lower(Str::random(10)).'@example.com',
            'address' => 'Via Example, 123',
            'postal_code' => '12345',
            'city' => 'Example City',
            'province' => 'EX',
        ]);

        $clientB = $companyB->clients()->create([
            'type' => 'PERSON',
            'name' => 'Luigi',
            'surname' => 'Verdi',
            'email' => 'luigi.'.Str::lower(Str::random(10)).'@example.com',
            'address' => 'Via Example, 456',
            'postal_code' => '67890',
            'city' => 'Example Town',
            'province' => 'EX',
        ]);

        $quoteA = $companyA->quotes()->create([
            'client_id' => $clientA->id,
            'number' => 'Q-001',
            'title' => 'Quote for Mario Rossi',
            'date' => now(),
            'total' => 100.00,
        ]);

        $quoteB = $companyB->quotes()->create([
            'client_id' => $clientB->id,
            'title' => 'Quote for Luigi Verdi',
            'number' => 'Q-002',
            'date' => now(),
            'total' => 200.00,
        ]);

        // azienda che vedo solo i suoi clienti
        $this->assertSame(
            [$clientA->id],
            $companyA->clients()->pluck('id')->all()
        );

        // e quotes
        $this->assertSame(
            [$quoteA->id],
            $companyA->quotes()->pluck('id')->all()
        );

        // verifico che l'azienda B veda solo i suoi clienti
        $this->assertFalse(
            $companyA->clients()->whereKey($clientB->id)->exists()
        );

        // e quotes
        $this->assertFalse(
            $companyA->quotes()->whereKey($quoteB->id)->exists()
        );
    }

    private function createCompany(): Company
    {
        $suffix = Str::lower(Str::random(10));

        return Company::create([
            'name' => 'Azienda '.$suffix,
            'legal_name' => 'Azienda Test '.$suffix,
            'vat_number' => 'IT'.$suffix,
            'tax_code' => 'CF'.$suffix,
            'address' => 'Via Roma 10',
            'postal_code' => '80100',
            'city' => 'Napoli',
            'province' => 'NA',
            'email' => $suffix.'@example.com',
            'phone' => '3'.$suffix,
        ]);
    }
}
