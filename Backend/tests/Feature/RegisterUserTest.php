<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Enums\CompanyRole;
use App\Domains\Companies\Models\Company;
use App\Domains\Companies\Models\CompanyUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterUserTest extends TestCase
{
    use RefreshDatabase;

    private const REGISTER_URL = '/api/register';

    /**
     * Crea il payload valido per la registrazione.
     */
    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Mario',
            'surname' => 'Rossi',
            'email' => 'mario.rossi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',

            'company_name' => 'Rossi Impianti',
            'legal_name' => 'Rossi Impianti S.r.l.',
            'country_code' => 'IT',
            'vat_number' => '12345678903',
            'tax_code' => '12345678903',
            'address' => 'Via Roma 1',
            'postal_code' => '00100',
            'city' => 'Roma',
            'province' => 'RM',
            'company_email' => 'info@rossiimpianti.it',
            'phone' => '+39 06 1234567',
        ], $overrides);
    }

    /**
     * Crea direttamente un'azienda esistente.
     */
    private function existingCompany(array $overrides = []): Company
    {
        return Company::create(array_merge([
            'name' => 'Azienda Esistente',
            'legal_name' => 'Azienda Esistente S.r.l.',
            'slug' => 'azienda-esistente',
            'country_code' => 'IT',
            'vat_number' => '12345678903',
            'tax_code' => '12345678903',
            'address' => 'Via Milano 5',
            'postal_code' => '20100',
            'city' => 'Milano',
            'province' => 'MI',
            'email' => 'esistente@example.com',
            'phone' => '+39 02 7654321',
        ], $overrides));
    }

    /**
     * Registra utente, azienda, impostazioni e associazione OWNER.
     */
    public function test_registra_utente_azienda_impostazioni_e_owner(): void
    {
        $response = $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        );

        $response->assertCreated()
            ->assertJsonPath(
                'message',
                'Registrazione effettuata con successo'
            );

        $user = User::where(
            'email',
            'mario.rossi@example.com'
        )->first();

        $company = Company::where(
            'vat_number',
            '12345678903'
        )->first();

        $this->assertNotNull($user);
        $this->assertNotNull($company);

        $this->assertSame('rossi-impianti', $company->slug);
        $this->assertSame('IT', $company->country_code);

        // Verifica l'associazione dell'utente come OWNER.
        $pivot = CompanyUser::where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->first();

        $this->assertNotNull($pivot);
        $this->assertSame(CompanyRole::Owner, $pivot->role);

        // Verifica la creazione delle impostazioni aziendali.
        $this->assertSame(
            1,
            $company->QuoteSettings()->count()
        );

        $settings = $company->QuoteSettings;

        $this->assertNotNull($settings);
        $this->assertSame('PREV', $settings->quote_prefix);
        $this->assertSame(1, $settings->quote_start_number);
        $this->assertSame(1, $settings->next_quote_number);
        $this->assertSame('22.00', (string) $settings->default_vat_rate);
        $this->assertSame(30, $settings->default_validity_days);
        $this->assertSame('EUR', $settings->default_currency);
        $this->assertSame('Europe/Rome', $settings->timezone);

        // Verifica l'autenticazione dopo la registrazione.
        $this->assertAuthenticated('web');
    }

    /**
     * Rifiuta una partita IVA con cifra di controllo errata.
     */
    public function test_rifiuta_una_partita_iva_non_valida(): void
    {
        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'vat_number' => '12345678901',
            ])
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['vat_number']);

        $this->assertSame(0, User::count());
        $this->assertSame(0, Company::count());
    }

    /**
     * Rifiuta una partita IVA già registrata nello stesso paese.
     */
    public function test_rifiuta_una_partita_iva_gia_registrata_nello_stesso_paese(): void
    {
        $this->existingCompany();

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['vat_number']);

        $this->assertSame(0, User::count());
    }

    /**
     * Rifiuta una partita IVA appartenente a un'azienda eliminata.
     */
    public function test_rifiuta_una_partita_iva_di_un_azienda_eliminata(): void
    {
        $this->existingCompany()->delete();

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['vat_number']);
    }

    /**
     * Normalizza la partita IVA con prefisso paese e spazi.
     */
    public function test_normalizza_la_partita_iva_con_prefisso_e_spazi(): void
    {
        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'vat_number' => 'IT 123 456 789 03',
            ])
        )->assertCreated();

        $company = Company::first();

        $this->assertNotNull($company);
        $this->assertSame('12345678903', $company->vat_number);
    }

    /**
     * Accetta la stessa partita IVA in un paese diverso.
     */
    public function test_accetta_la_stessa_partita_iva_in_un_paese_diverso(): void
    {
        $this->existingCompany();

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'country_code' => 'DE',
                'vat_number' => '12345678903',
                'tax_code' => null,
                'postal_code' => '10115',
                'province' => 'BE',
            ])
        )->assertCreated();

        $this->assertSame(2, Company::count());
    }

    /**
     * Accetta lo stesso telefono per aziende diverse.
     */
    public function test_accetta_lo_stesso_telefono_per_aziende_diverse(): void
    {
        $this->existingCompany([
            'phone' => '+39 06 1234567',
        ]);

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'vat_number' => '01234567897',
                'company_email' => 'altra@example.com',
                'phone' => '+39 06 1234567',
            ])
        )->assertCreated();

        $this->assertSame(2, Company::count());
    }

    /**
     * Rifiuta un indirizzo email utente già utilizzato.
     */
    public function test_rifiuta_un_email_utente_gia_utilizzata(): void
    {
        User::factory()->create([
            'email' => 'mario.rossi@example.com',
        ]);

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Rifiuta un indirizzo email aziendale già utilizzato.
     */
    public function test_rifiuta_un_email_aziendale_gia_utilizzata(): void
    {
        $this->existingCompany([
            'email' => 'info@rossiimpianti.it',
            'vat_number' => '01234567897',
        ]);

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['company_email']);
    }

    /**
     * Richiede il codice fiscale per le aziende italiane.
     */
    public function test_richiede_il_codice_fiscale_per_le_aziende_italiane(): void
    {
        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'tax_code' => null,
            ])
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tax_code']);
    }

    /**
     * Valida CAP e provincia italiani.
     */
    public function test_valida_cap_e_provincia_italiani(): void
    {
        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'postal_code' => '123',
                'province' => 'ROMA',
            ])
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'postal_code',
                'province',
            ]);
    }

    /**
     * Rifiuta regime fiscale e codice SDI non validi.
     */
    public function test_rifiuta_regime_fiscale_e_codice_sdi_non_validi(): void
    {
        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'tax_regime' => 'RF03',
                'sdi_code' => 'ABC',
            ])
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'tax_regime',
                'sdi_code',
            ]);
    }

    /**
     * Genera slug univoci per aziende con lo stesso nome.
     */
    public function test_genera_slug_univoci_per_aziende_con_lo_stesso_nome(): void
    {
        $this->existingCompany([
            'name' => 'Rossi Impianti',
            'slug' => 'rossi-impianti',
            'vat_number' => '01234567897',
        ]);

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload([
                'company_email' => 'altra@example.com',
            ])
        )->assertCreated();

        $company = Company::where(
            'vat_number',
            '12345678903'
        )->first();

        $this->assertNotNull($company);
        $this->assertSame('rossi-impianti-2', $company->slug);
    }

    /**
     * Verifica il rollback quando la creazione dell'azienda fallisce.
     */
    public function test_annulla_la_registrazione_se_la_creazione_dell_azienda_fallisce(): void
    {
        Company::creating(
            function (): void {
                throw new \RuntimeException('Errore simulato');
            }
        );

        $this->postJson(
            self::REGISTER_URL,
            $this->registrationPayload()
        )->assertServerError();

        $this->assertSame(0, User::count());
        $this->assertSame(0, Company::count());
        $this->assertSame(0, CompanyUser::count());

        $this->assertGuest('web');
    }
}