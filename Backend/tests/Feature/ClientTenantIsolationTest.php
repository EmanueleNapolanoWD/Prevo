<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use App\Domains\Clients\Models\Client;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ClientTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_access_a_client_of_its_own_company(): void
    {
        [$userA, $companyA] = $this->createTenant();
        $clientA = $this->createClient($companyA);

        $response = $this->actingAs($userA)
            ->getJson("/api/companies/{$companyA->id}/clients/{$clientA->id}");

        $response->assertOk()
            ->assertJsonPath('id', $clientA->id)
            ->assertJsonPath('company_id', $companyA->id);

    }

    public function test_user_cannot_access_another_companys_client(): void
    {
        [$userA, $companyA] = $this->createTenant();
        [, $companyB] = $this->createTenant();

        $clientB = $this->createClient($companyB);

        $response = $this->actingAs($userA)
            ->getJson("/api/companies/{$companyA->id}/clients/{$clientB->id}");

        $response->assertNotFound();
    }

    public function test_user_cannot_list_another_companys_clients(): void
    {
        [$userA] = $this->createTenant();
        [, $companyB] = $this->createTenant();

        $this->createClient($companyB);

        $response = $this->actingAs($userA)
            ->getJson("/api/companies/{$companyB->id}/clients");

        $response->assertNotFound();
    }

    private function createTenant(
        CompanyRole $role = CompanyRole::OWNER
    ): array {
        $suffix = Str::lower(Str::random(12));

        $user = User::create([
            'name' => 'Test',
            'surname' => 'User',
            'email' => $suffix.'@example.com',
            'password' => 'Password123!',
        ]);

        $company = Company::create([
            'name' => 'Azienda '.$suffix,
            'legal_name' => 'Azienda Test '.$suffix,
            'vat_number' => 'IT'.$suffix,
            'tax_code' => 'CF'.$suffix,
            'address' => 'Via Roma 10',
            'postal_code' => '80100',
            'city' => 'Napoli',
            'province' => 'NA',
            'email' => 'azienda.'.$suffix.'@example.com',
            'phone' => '3'.$suffix,
        ]);

        $user->companies()->attach($company->id, [
            'id' => (string) Str::uuid(),
            'role' => $role->value,
        ]);

        return [$user, $company];
    }

    public function test_user_can_update_its_own_client(): void
    {
        [$userA, $companyA] = $this->createTenant();
        $clientA = $this->createClient($companyA);

        $response = $this->actingAs($userA)
            ->patchJson(
                "/api/companies/{$companyA->id}/clients/{$clientA->id}",
                ['name' => 'Luigi']
            );

        $response->assertOk()
            ->assertJsonPath('data.name', 'Luigi');

        $this->assertDatabaseHas('clients', [
            'id' => $clientA->id,
            'company_id' => $companyA->id,
            'name' => 'Luigi',
        ]);
    }

    public function test_user_cannot_update_another_companys_client(): void
    {
        [$userA, $companyA] = $this->createTenant();
        [, $companyB] = $this->createTenant();

        $clientB = $this->createClient($companyB);

        $response = $this->actingAs($userA)
            ->patchJson(
                "/api/companies/{$companyA->id}/clients/{$clientB->id}",
                ['name' => 'Modifica non autorizzata']
            );

        $response->assertNotFound();

        $this->assertDatabaseHas('clients', [
            'id' => $clientB->id,
            'company_id' => $companyB->id,
            'name' => 'Mario',
        ]);
    }

    public function test_user_can_soft_delete_its_own_client(): void
    {
        [$userA, $companyA] = $this->createTenant();
        $clientA = $this->createClient($companyA);

        $response = $this->actingAs($userA)
            ->deleteJson(
                "/api/companies/{$companyA->id}/clients/{$clientA->id}"
            );

        $response->assertNoContent();

        $this->assertSoftDeleted('clients', [
            'id' => $clientA->id,
            'company_id' => $companyA->id,
        ]);
    }

    public function test_user_cannot_delete_another_companys_client(): void
    {
        [$userA, $companyA] = $this->createTenant();
        [, $companyB] = $this->createTenant();

        $clientB = $this->createClient($companyB);

        $response = $this->actingAs($userA)
            ->deleteJson(
                "/api/companies/{$companyA->id}/clients/{$clientB->id}"
            );

        $response->assertNotFound();

        $this->assertDatabaseHas('clients', [
            'id' => $clientB->id,
            'company_id' => $companyB->id,
            'deleted_at' => null,
        ]);
    }

    private function createClient(Company $company): Client
    {
        $suffix = Str::lower(Str::random(12));

        return $company->clients()->create([
            'type' => 'PERSON',
            'name' => 'Mario',
            'surname' => 'Rossi',
            'email' => $suffix.'@example.com',
            'address' => 'Via Roma 10',
            'postal_code' => '80100',
            'city' => 'Napoli',
            'province' => 'NA',
        ]);
    }

    public function test_employee_cannot_delete_its_own_client(): void
    {
        [$employee, $company] = $this->createTenant(
            CompanyRole::EMPLOYEE
        );

        $client = $this->createClient($company);

        $response = $this->actingAs($employee)->deleteJson(
            "/api/companies/{$company->id}/clients/{$client->id}"
        );

        $response->assertForbidden();

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'company_id' => $company->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_can_delete_its_own_client(): void
    {
        [$admin, $company] = $this->createTenant(
            CompanyRole::ADMIN
        );

        $client = $this->createClient($company);

        $response = $this->actingAs($admin)->deleteJson(
            "/api/companies/{$company->id}/clients/{$client->id}"
        );

        $response->assertNoContent();

        $this->assertSoftDeleted('clients', [
            'id' => $client->id,
            'company_id' => $company->id,
        ]);
    }
}
