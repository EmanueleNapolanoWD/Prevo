<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Models\CompanySettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CompanyRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_belong_to_multiple_companies_with_different_roles(): void
    {
        $user = User::factory()->create();

        $companyOwner = $this->createCompany();
        $companyEmployee = $this->createCompany();

        $user->companies()->attach($companyOwner->id, [
            'role' => CompanyRole::OWNER->value,
        ]);

        $user->companies()->attach($companyEmployee->id, [
            'role' => CompanyRole::EMPLOYEE->value,
        ]);

        $this->assertCount(2, $user->companies);

        $ownerMembership = $user->companyUsers()
            ->where('company_id', $companyOwner->id)
            ->firstOrFail();

        $this->assertSame(CompanyRole::OWNER, $ownerMembership->role);
        $this->assertCount(2, $user->companyUsers);
    }

    public function test_company_can_retrieve_its_associated_users(): void
    {
        $user = User::factory()->create();
        $company = $this->createCompany();

        $company->users()->attach($user->id, [
            'role' => CompanyRole::ADMIN->value,
        ]);

        $this->assertCount(1, $company->users);
        $this->assertSame(
            $user->id,
            $company->users->first()->id
        );

        $this->assertSame(
            CompanyRole::ADMIN,
            $company->users->first()->pivot->role
        );
    }

    public function test_company_has_one_settings_record(): void
    {
        $company = $this->createCompany();

        $settings = CompanySettings::create([
            'company_id' => $company->id,
            'quote_prefix' => 'PREV',
            'quote_start_number' => 1,
            'default_vat_rate' => 22.00,
            'default_validity_days' => 30,
            'default_currency' => 'EUR',
            'default_notes' => 'Note predefinite',
            'default_terms' => 'Termini di pagamento',
        ]);

        $this->assertSame(
            $settings->id,
            $company->companySettings->id
        );

        $this->assertSame(
            $company->id,
            $settings->company->id
        );
    }

    private function createCompany(): Company
    {
        $suffix = Str::lower(Str::random(10));

        return Company::create([
            'name' => 'Azienda ' . $suffix,
            'legal_name' => 'Azienda Test ' . $suffix,
            'vat_number' => 'IT' . $suffix,
            'tax_code' => 'CF' . $suffix,
            'address' => 'Via Roma 10',
            'postal_code' => '80100',
            'city' => 'Napoli',
            'province' => 'NA',
            'email' => $suffix . '@example.com',
            'phone' => '3' . $suffix,
        ]);
    }
}