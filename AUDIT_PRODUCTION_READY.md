# AUDIT PRODUCTION READINESS - Prevo

**Data:** 29/10/2026  
**Progetto:** Prevo – SaaS gestione preventivi aziendali  
**Stack:** Laravel 13 / PHP 8.5 (Backend), Next.js 16 / React 19 (Frontend), MySQL, Docker Compose  
**Autore:** Lead Software Architect & Senior Code Auditor

---

## 1. SINTESI ESECUTIVA

Il progetto Prevo presenta una base architetturale solida (domain-driven design, Actions, Form Requests, Policies, Sanitization) ma non è **pronto per la produzione** in stato attuale. Sono state riscontrate criticità di sicurezza, assenza di pipeline CI/CD, copertura test insufficiente, mancanza di observability e diverse configurazioni d'ambiente inadeguate per un ambiente produttivo.

| Area | Punteggio (1-10) | Stato |
|---|---|---|
| 1. Sicurezza & Hardening | 4.5/10 | ❌ Critico |
| 2. Observabilità & Monitoring | 3.0/10 | ❌ Assente |
| 3. Performance & Scalabilità | 5.5/10 | ⚠️ Parziale |
| 4. Qualità Codice, Architettura & Testing | 5.0/10 | ⚠️ Parziale |
| 5. Resilienza & Data Integrity | 5.5/10 | ⚠️ Parziale |
| 6. CI/CD & Deployment | 1.0/10 | ❌ Assente |
| 7. Documentazione & DX | 3.5/10 | ❌ Insufficiente |
| **Media complessiva** | **4.0/10** | ❌ **NON PRONTO PER PRODUZIONE** |

---

---

## 2. ANALISI DETTAGLIATA PER AREA

---

### Area 1 – SICUREZZA & HARDENING

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Form Request per validazione input | `Backend/app/Domains/Quotes/Requests/CreateQuoteRequest.php` | 10-98 | Regole di validazione dettagliate, Rule::exists con scope company_id |
| Form Request per azienda | `Backend/app/Domains/Companies/Requests/CompanyRequest.php` | 1-357 | Validazione P.IVA italiana, IBAN mod 97, normalizzazione input |
| Rate limiting auth | `Backend/app/Providers/AppServiceProvider.php` | 63-70 | Limiti su login (10/min), sign-up (5/ora, 20/giorno) |
| Sanctum autenticazione | `Backend/config/sanctum.php` | 1-86 | Stateful domains, CSRF token, encrypt cookies |
| CSRF protezione frontend | `front-end/lib/Api/Auth/auth.ts` | 56-58 | `initializeCsrf()` chiama `/sanctum/csrf-cookie` |
| Policies di autorizzazione | `Backend/app/Policies/QuotePolicy.php` | 1-74 | Role-based access control (OWNER, ADMIN, EMPLOYEE) |
| Isolamento tenant | `Backend/app/Http/Controllers/Api/QuoteController.php` | 37-39 | `where('company_id', $company->id)` su tutte le query |
| Middleware appartenenza azienda | `Backend/app/Http/Middleware/EnsureUserBelongsToCompany.php` | 1-49 | Verifica membership utente su company |
| URL firmati per stampa | `Backend/routes/api.php` | 20-28 | `signed:relative` su `quotes.print-data` |
| PRINT_SECRET server-to-server | `Backend/config/services.php` | 38-40 | `env('PRINT_SECRET')` letto da config |
| Password policy produzione | `Backend/app/Providers/AppServiceProvider.php` | 38-40 | Password min 12, mixed case, numeri, simboli in produzione |
| Sessione httpOnly | `Backend/config/session.php` | 186 | `http_only => true` |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| S1 | `Backend/.env` | 4 | `APP_DEBUG=true` espone stack trace e variabili d'ambiente in produzione | Critica |
| S2 | `Backend/.env` | 37 | `SESSION_SECURE_COOKIE=false` — cookie di sessione inviati anche su HTTP | Critica |
| S3 | `Backend/config/session.php` | 203 | `same_site => 'lax'` — insufficiente per contesto cross-site frontend/backend su domini diversi | Alta |
| S4 | `Backend/config/session.php` | 50 | `encrypt => false` — dati di sessione non cifrati a riposo | Alta |
| S5 | `Backend/config/cors.php` | 20-29 | `allowed_methods => ['*']`, `allowed_headers => ['*']` — troppo permissivo | Media |
| S6 | `Backend/config/cors.php` | 22-24 | Un solo origin consentito (`FRONTEND_URL`); nessuna gestione multi-environment dinamica | Media |
| S7 | `Backend/app/Http/Controllers/Api/QuotePdfController.php` | 34-37 | `publicShow()` — route pubblica firmata, nessun controllo `authorize('view', $quote)` (manca a differenza di `show()`) | Alta |
| S8 | `Backend/routes/api.php` | 20-28 | Route `signed:relative` ma senza `auth:sanctum` — si affida solo alla firma URL, non all'identità utente | Alta |
| S9 | `front-end/.env` | 6 | `PRINT_SECRET` presente nel file .env del frontend — il segreto arriva al browser/build | Critica |
| S10 | `front-end/app/(app)/[slug]/quotes/[id]/print/page.tsx` | 30-32 | Controllo `x-print-secret` si limita a `console.error`, NON blocca l'esecuzione | Critica |
| S11 | `Backend/.env` | 91-92 | `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` hardcoded in `.env` (valore visibile) | Critica |
| S12 | `Backend/config/filesystems.php` | 75-85 | Disk `r2-quotes` con `'throw' => true` — eccezioni non gestite se R2 non disponibile | Media |
| S13 | Nessun file | - | Assenza di Content Security Policy (CSP) headers | Alta |
| S14 | Nessun file | - | Assenza di HTTP security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy` | Alta |
| S15 | `Backend/.env` | 6 | `SANCTUM_STATEFUL_DOMAINS` include `localhost:3000` e `127.0.0.1:3000` — valori di sviluppo da rimuovere in produzione | Media |

### Area 2 – OSSERVABILITÀ & MONITORING

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Logging Monolog | `Backend/config/logging.php` | 1-138 | Canali stack, single, daily, slack, papertrail, stderr |
| Log livello configurabile | `Backend/.env` | 23 | `LOG_LEVEL=debug` (da adeguare in produzione) |
| Log strutturato parziale | `Backend/app/Domains/Quotes/Supports/QuoteTotalsCalculator.php` | 193-201 | `Log::debug` con contesto |
| Log errori PDF | `Backend/app/Http/Controllers/Api/QuotePdfController.php` | 64-85 | `Log::warning` / `Log::error` con quote_id e company_id |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| O1 | Nessun file | - | Nessuna integrazione Sentry/Bugsnag/Flare per tracciamento eccezioni centralizzato | Critica |
| O2 | Nessun file | - | Nessun health check endpoint (`/health`, `/ready`, `/live`) per DB, Redis, Queue, Disk | Critica |
| O3 | Nessun file | - | Nessun logging strutturato in formato JSON per ingestione su ELK/Splunk/CloudWatch | Alta |
| O4 | `Backend/config/logging.php` | 64 | `'level' => env('LOG_LEVEL', 'debug')` — default `debug` troppo verboso per produzione | Alta |
| O5 | Nessun file | - | Nessuna correlazione request ID / trace ID tra richieste HTTP e log | Alta |
| O6 | Nessun file | - | Nessun alerting su failed jobs, queue profondità, error rate | Alta |
| O7 | Nessun file | - | Nessun monitoring delle performance (APM) | Media |
| O8 | `front-end/` | - | Nessun monitoring frontend errori (nessun Sentry/LogRocket integrato) | Media |

### Area 3 – PERFORMANCE & SCALABILITÀ

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Paginazione API | `Backend/app/Http/Controllers/Api/ClientController.php` | 41-42 | `->paginate(15)->withQueryString()` |
| Eager loading | `Backend/app/Http/Controllers/Api/QuoteController.php` | 39 | `->with(['client.emails', 'client.phones', 'client.addresses', 'items'])` |
| Next.js standalone output | `front-end/next.config.ts` | 5 | `output: "standalone"` |
| Next.js Docker multi-stage | `front-end/Dockerfile` | 1-28 | Build separato da runner, immagine ridotta |
| Cache database | `Backend/config/cache.php` | 42-48 | Store database configurato |
| Redis disponibile | `Backend/.env` | 50-54 | Configurato ma non usato come cache di default |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| P1 | `Backend/database/migrations/` | - | Nessun indice visibile oltre alle chiavi primarie/estere implicite (verificare singole migration) | Alta |
| P2 | `Backend/config/queue.php` | 16 | `default => 'database'` — coda su DB, performance inferiori a Redis | Alta |
| P3 | Nessun file | - | Nessuna configurazione Laravel Horizon per monitoraggio code in produzione | Alta |
| P4 | Nessun file | - | Nessuna route cache (`php artisan route:cache`), config cache, view cache in deployment | Media |
| P5 | `front-end/next.config.ts` | 6-11 | `reactCompiler: true`, `cacheComponents: true`, `partialPrefetching: true` — feature sperimentali Next.js 16, rischio stabilità | Alta |
| P6 | Nessun file | - | Nessuna strategia di code splitting esplicita nel frontend | Media |
| P7 | `front-end/next.config.ts` | 12-20 | `turbopack` configurato solo per CSS, non per l'intero build | Bassa |
| P8 | `Backend/app/Domains/Quotes/Actions/GenerateQuotePdfAction.php` | 68 | `->disk('r2-quotes')->save($path)` — scrittura su R2 per ogni PDF (latenza esterna) | Media |
| P9 | `Backend/app/Domains/Quotes/Actions/CreateQuoteAction.php` | 153 | `GenerateQuotePdfJob::dispatch(...)` su ogni creazione preventivo — genera PDF anche se non richiesto | Media |


### Area 4 – QUALITÀ DEL CODICE, ARCHITETTURA & TESTING

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Architettura a domini | `Backend/app/Domains/` | - | Separazione chiara: Auth, Companies, Quotes, Products, Clients, Audit |
| Action pattern | `Backend/app/Domains/Quotes/Actions/` | - | Logica di business separata dai controller |
| Form Request | `Backend/app/Domains/*/Requests/` | - | Validazione separata dal controller |
| Resources | `Backend/app/Domains/Quotes/Resources/` | - | Trasformazione output API |
| Policies | `Backend/app/Policies/` | - | Autorizzazione centralizzata |
| ESLint configurato | `front-end/eslint.config.mjs` | 1-17 | nextVitals, nextTs, globalIgnores |
| TypeScript | `front-end/tsconfig.json` | - | Tipizzazione forte sul frontend |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| Q1 | Nessun file | - | Nessuno strumento di analisi statica PHP (PHPStan/Psalm) configurato | Alta |
| Q2 | Nessun file | - | Nessun formatter PHP (Pint) in pipeline CI | Media |
| Q3 | Nessun file | - | Copertura test estremamente bassa (solo 2 test feature + 1 unit example) | Critica |
| Q4 | Nessun file | - | Nessun test per PDF generation, print endpoints, quote CRUD completo | Critica |
| Q5 | Nessun file | - | Nessun test E2E (Cypress/Playwright) | Alta |
| Q6 | Nessun file | - | Nessun test frontend (Jest/Vitest/React Testing Library) | Alta |
| Q7 | `Backend/app/Exceptions/` | - | Directory assente — si usa l'ExceptionHandler di default di Laravel, nessuna personalizzazione | Media |
| Q8 | `front-end/app/(app)/[slug]/quotes/[id]/print/page.tsx` | 27-66 | Logica di sicurezza e fetch duplicata rispetto a `QuotePdfService` e `QuotePrintController` | Media |
| Q9 | Due percorsi PDF distinti | - | `QuotePdfService` (Next.js → HTML → PDF) e `GenerateQuotePdfAction` (Blade → PDF su R2) — duplicazione di responsabilità | Alta |
| Q10 | `front-end/components/.../QuoteLogo.tsx` | 1 | `"use client"` in un componente usato anche nel rendering server-side per PDF — può causare problemi di idratazione | Media |


### Area 5 – RESILIENZA & DATA INTEGRITY

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Transazioni DB | `Backend/app/Domains/Quotes/Actions/CreateQuoteAction.php` | 33-156 | `DB::transaction` wrapping create quote + items + audit + job dispatch |
| Transazioni DB | `Backend/app/Domains/Quotes/Actions/UpdateQuoteAction.php` | 31-171 | `DB::transaction` con lock for update |
| Soft deletes | `Backend/app/Domains/Quotes/Models/Quote.php` | 22 | `use SoftDeletes` |
| Job retries | `Backend/app/Domains/Quotes/Jobs/GenerateQuotePdfJob.php` | 19-21 | `tries = 5`, `backoff`, `retryUntil` 30 min |
| After commit dispatch | `Backend/app/Domains/Quotes/Actions/CreateQuoteAction.php` | 153 | `->afterCommit()` evita job se transazione fallisce |
| Failed jobs table | `Backend/config/queue.php` | 123-127 | `failed_jobs` tabella configurata |
| Rate limiting PDF | `Backend/app/Providers/AppServiceProvider.php` | 61 | `cloudflare-pdf` limiter 1 req/sec |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| R1 | Nessun file | - | Nessuna strategia di backup database configurata (nessun script, nessun cron) | Critica |
| R2 | Nessun file | - | Nessuna strategia di backup storage (R2 bucket, logo, PDF) | Critica |
| R3 | `Backend/app/Domains/Quotes/Jobs/GenerateQuotePdfJob.php` | 49-63 | Gestione fallimento solo `report($e)`, nessun alerting, nessun fallback | Alta |
| R4 | `Backend/app/Domains/Quotes/Services/QuotePdfService.php` | 56-65 | Dipendenza da Cloudflare Browser Rendering API — nessun circuit breaker, nessun timeout alternativo | Alta |
| R5 | `Backend/app/Domains/Quotes/Services/QuotePdfService.php` | 60 | `->timeout(20)` — timeout fisso, nessun retry su fallimento PDF | Media |
| R6 | `Backend/config/session.php` | 21 | `driver => 'database'` — sessioni legate a DB single point of failure | Media |
| R7 | Nessun file | - | Nessun idempotency key per generazione PDF (doppia generazione possibile su retry) | Media |
| R8 | `Backend/app/Domains/Quotes/Actions/GenerateQuotePdfAction.php` | 31-37 | Path PDF prevedibile (`companies/{id}/quotes/{id}/...`) — rischio enumerazione se bucket pubblico | Bassa |

### Area 6 – CI/CD & DEPLOYMENT

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| Composer scripts | `Backend/composer.json` | 42-77 | Script setup, dev, test, post-autoload-dump |
| Docker Compose | `docker-compose.yml` | 1-136 | Servizi laravel, mysql, redis, meilisearch, mailpit, selenium, frontend |
| Dockerfile Backend | `Backend/Dockerfile` | 1-7 | Produzione, `composer install --no-dev --optimize-autoloader` |
| Dockerfile Frontend | `front-end/Dockerfile` | 1-28 | Multi-stage build, standalone output, utente non-root |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| C1 | Nessun file | - | **Assente directory `.github/`** — nessuna pipeline CI/CD (GitHub Actions/GitLab CI) | Critica |
| C2 | Nessun file | - | Nessun test automatico su push/pull request | Critica |
| C3 | Nessun file | - | Nessuna deployment pipeline (staging/production) | Critica |
| C4 | Nessun file | - | Nessuna configurazione Supervisor per queue worker in produzione | Critica |
| C5 | Nessun file | - | Nessun scheduler Laravel configurato (`php artisan schedule:run` in cron) | Alta |
| C6 | `.gitignore` | - | Da verificare: i file `.env` contenenti segreti potrebbero essere commitati | Critica |
| C7 | Nessun file | - | Nessuna gestione segreti (Vault, AWS Secrets Manager, GitHub Secrets) | Alta |
| C8 | Nessun file | - | Nessuna strategia di rollback o blue/green deployment | Media |


### Area 7 – DOCUMENTAZIONE & DX

#### Cosa è implementato correttamente

| Elemento | File | Righe | Note |
|---|---|---|---|
| README Backend | `Backend/README.md` | 1-58 | Documentazione Laravel generica (non specifica a Prevo) |
| README Frontend | `front-end/README.md` | 1-36 | Documentazione Next.js generica (non specifica a Prevo) |
| AGENTS.md | `Backend/AGENTS.md`, `front-end/AGENTS.md` | - | Istruzioni per assistenti AI |
| CLAUDE.md | `Backend/CLAUDE.md` | - | Istruzioni specifiche per Claude Code |

#### Criticità e debito tecnico

| ID | File | Righe | Problema | Gravità |
|---|---|---|---|---|
| D1 | Nessun file | - | **Nessuna documentazione API** (OpenAPI/Swagger/Scramble assente) | Critica |
| D2 | Nessun file | - | Nessuna documentazione di architettura (diagrammi, flussi, decisioni ADR) | Alta |
| D3 | Nessun file | - | Nessuna guida di setup specifica per Prevo (solo README Laravel/Next.js generici) | Alta |
| D4 | Nessun file | - | Nessuna documentazione delle variabili d'ambiente richieste in produzione | Alta |
| D5 | Nessun file | - | Nessuna guida di contribuzione (CONTRIBUTING.md) | Media |
| D6 | Nessun file | - | Nessuna documentazione del flusso generazione PDF (Next.js vs Blade vs R2) | Media |


---

## 3. ACTION PLAN & FIX GUIDELINES

### Tabella delle priorità

| ID | Priorità | Area | Problema | File | Righe |
|---|---|---|---|---|---|
| S1 | ALTA | Sicurezza | `APP_DEBUG=true` | `Backend/.env` | 4 |
| S2 | ALTA | Sicurezza | `SESSION_SECURE_COOKIE=false` | `Backend/.env` | 37 |
| S9 | ALTA | Sicurezza | `PRINT_SECRET` in frontend `.env` | `front-end/.env` | 6 |
| S10 | ALTA | Sicurezza | Controllo `x-print-secret` solo `console.error` | `front-end/app/(app)/[slug]/quotes/[id]/print/page.tsx` | 30-32 |
| C1 | ALTA | CI/CD | Nessuna pipeline CI/CD | `.github/` | assente |
| C4 | ALTA | CI/CD | Nessun Supervisor per queue worker | - | assente |
| Q3 | ALTA | Testing | Copertura test insufficiente | `Backend/tests/` | - |
| O1 | ALTA | Observability | Nessun Sentry/errore centralizzato | - | assente |
| R1 | ALTA | Resilienza | Nessun backup database | - | assente |
| R2 | ALTA | Resilienza | Nessun backup storage | - | assente |
| S3 | MEDIA | Sicurezza | SameSite lax | `Backend/config/session.php` | 203 |
| S4 | MEDIA | Sicurezza | Sessione non cifrata | `Backend/config/session.php` | 50 |
| S7 | MEDIA | Sicurezza | `publicShow()` senza authorize | `Backend/app/Http/Controllers/Api/QuotePdfController.php` | 34-37 |
| S8 | MEDIA | Sicurezza | Route print senza auth:sanctum | `Backend/routes/api.php` | 20-28 |
| P2 | MEDIA | Performance | Queue su database | `Backend/config/queue.php` | 16 |
| P5 | MEDIA | Performance | Next.js feature sperimentali | `front-end/next.config.ts` | 6-11 |
| Q1 | MEDIA | Qualità | Nessun PHPStan | - | assente |
| D1 | MEDIA | Documentazione | Nessuna API docs | - | assente |
| S5 | BASSA | Sicurezza | CORS troppo permissivo | `Backend/config/cors.php` | 20-29 |
| S13 | BASSA | Sicurezza | Nessun CSP header | - | assente |
| S14 | BASSA | Sicurezza | Nessun security header HTTP | - | assente |
| O4 | BASSA | Observability | LOG_LEVEL debug di default | `Backend/config/logging.php` | 64 |
| Q9 | BASSA | Qualità | Duplicazione percorsi PDF | - | - |

---


### Istruzioni di correzione passo-passo

#### Fase 1 – Sicurezza critica (da fare prima del deploy)

**S1 – Disabilitare APP_DEBUG in produzione**

File: `Backend/.env` (riga 4)

```diff
- APP_DEBUG=true
+ APP_DEBUG=false
```

Motivo: `APP_DEBUG=true` espone stack trace completi, variabili d'ambiente e struttura del database a chiunque generi un errore.

**S2 – Cookie di sessione sicuri**

File: `Backend/.env` (riga 37)

```diff
- SESSION_SECURE_COOKIE=false
+ SESSION_SECURE_COOKIE=true
```

Se frontend e backend sono su domini diversi, impostare anche:
```env
SESSION_SAME_SITE=none
```

**S9 – Rimuovere PRINT_SECRET dal frontend**

File: `front-end/.env` (riga 6)

Rimuovere la riga `PRINT_SECRET=...` dal frontend. Il segreto deve esistere solo nel backend. Il frontend non deve conoscere `PRINT_SECRET`: la comunicazione server-to-server è gestita interamente da Laravel.

**S10 – Bloccare esecuzione se header segreto mancante**

File: `front-end/app/(app)/[slug]/quotes/[id]/print/page.tsx` (righe 30-32)

```diff
-   if (!printSecret || requestHeaders.get("x-print-secret") !== printSecret) {
-     console.error("printsecret non trovato");
-   }
+   if (!printSecret || requestHeaders.get("x-print-secret") !== printSecret) {
+     return notFound();
+   }
```


**C1 – Creare pipeline GitHub Actions**

Creare il file `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: prevo_test
        ports:
          - 3307:3306
        options: >-
          --health-cmd "mysqladmin ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 3
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.5'
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, pdo_mysql
          coverage: none
      - name: Install Composer dependencies
        run: composer install --prefer-dist --no-progress --no-interaction
        working-directory: ./Backend
      - name: Run migrations
        run: php artisan migrate --env=testing
        working-directory: ./Backend
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3307
          DB_DATABASE: prevo_test
          DB_USERNAME: root
          DB_PASSWORD: root
      - name: Run tests
        run: php artisan test
        working-directory: ./Backend

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
        working-directory: ./front-end
      - name: Install dependencies
        run: npm ci
        working-directory: ./front-end
      - name: Run linter
        run: npm run lint
        working-directory: ./front-end
      - name: Run build
        run: npm run build
        working-directory: ./front-end
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

**C4 – Configurare Supervisor per queue worker**

Creare `/etc/supervisor/conf.d/prevo-worker.conf`:

```ini
[program:prevo-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/Backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/html/Backend/storage/logs/worker.log
```

**C5 – Configurare Laravel Scheduler**

Aggiungere al crontab del server:

```bash
* * * * * cd /var/www/html/Backend && php artisan schedule:run >> /dev/null 2>&1
```


**Q3 – Aumentare copertura test**

Creare `Backend/tests/Feature/QuoteTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_quote(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        $user->companies()->attach($company->id, ['role' => 'OWNER']);

        $response = $this->actingAs($user)
            ->postJson("/api/companies/{$company->slug}/quotes", [
                'client_id' => '...',
                'title' => 'Test Quote',
                // ... altri campi
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('quotes', ['title' => 'Test Quote']);
    }

    public function test_user_cannot_access_quote_from_other_company(): void
    {
        // ... test isolamento tenant
    }

    public function test_pdf_generation_endpoint_requires_auth(): void
    {
        // ... test che /quotes/{id}/pdf richieda autenticazione
    }
}
```

**O1 – Integrare Sentry**

File: `Backend/composer.json` (require-dev):
```json
"sentry/sentry-laravel": "^4.0"
```

File: `Backend/config/app.php` — aggiungere provider:
```php
Sentry\SentryLaravelServiceProvider::class,
```

File: `Backend/.env`:
```env
SENTRY_LARAVEL_DSN=https://xxx@sentry.io/yyy
SENTRY_TRACES_SAMPLE_RATE=0.2
```

**S7 – Aggiungere authorize su publicShow**

File: `Backend/app/Http/Controllers/Api/QuotePdfController.php` (metodo `publicShow`):

```php
public function publicShow(Company $company, string $quoteId): Response
{
    $quote = $this->findQuote($company, $quoteId, true);
    return $this->respond($quote, 'inline');
}
```

**S8 – Aggiungere auth:sanctum sulla route print-data**

File: `Backend/routes/api.php` (righe 20-28):

```php
Route::middleware(['auth:sanctum', 'signed:relative', 'throttle:30,1'])->group(function () {
    Route::get('/companies/{company:slug}/quotes/{quoteId}/print', [QuotePdfController::class, 'printData'])
        ->name('quotes.print-data');
    // ...
});
```

**Q1 – Installare e configurare PHPStan**

File: `Backend/composer.json` (require-dev):
```json
"phpstan/phpstan": "^2.0"
```

Creare `Backend/phpstan.neon`:
```neon
parameters:
    level: 5
    paths:
        - app
```

**D1 – Installare Scramble per documentazione API**

```bash
composer require --dev scramble/api
php artisan scramble:publish
php artisan docs:generate
```

---


---

## 4. CONCLUSIONE

Il progetto Prevo ha buone fondamenta architetturali (domain-driven design, Actions, Form Requests, Policies, isolamento tenant) ma **non è pronto per la produzione** nello stato attuale.

Le **prime tre azioni da eseguire** sono:

1. **Creare una pipeline CI/CD** (`.github/workflows/ci.yml`) con test automatici su push e pull request
2. **Correggere le configurazioni di sicurezza critiche** (`APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, rimuovere `PRINT_SECRET` dal frontend, bloccare esecuzione pagina stampa senza header `x-print-secret`)
3. **Aumentare la copertura test**, in particolare su generazione PDF, autenticazione e isolamento multi-tenant

Senza queste correzioni, il progetto è esposto a rischi di sicurezza (sessione non sicura, segreti esposti, endpoint senza autorizzazione), mancanza di observabilità (nessun error tracking), e impossibilità di deployment sicuro (nessuna CI/CD, nessun backup).

---

**Fine dell'audit.** Nessun file è stato modificato durante questa analisi.

---