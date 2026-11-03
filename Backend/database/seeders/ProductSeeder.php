<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Companies\Models\Company;
use App\Domains\Products\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Azienda a cui associare i prodotti demo.
        $company = Company::query()
            ->where('slug', 'emanuele-impianti')
            ->first();

        if (! $company) {
            throw new RuntimeException(
                'Azienda "emanuele-impianti" non trovata. '
                . 'Modifica lo slug nel seeder con quello della tua azienda.'
            );
        }

        $products = [
            [
                'code' => 'MAT-001',
                'name' => 'Cavo elettrico unipolare 1,5 mm²',
                'unit' => 'm',
                'description' => 'Cavo elettrico per impianti civili.',
                'sale_price' => 0.85,
                'cost_price' => 0.42,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-002',
                'name' => 'Cavo elettrico unipolare 2,5 mm²',
                'unit' => 'm',
                'description' => 'Cavo elettrico per prese e circuiti.',
                'sale_price' => 1.20,
                'cost_price' => 0.65,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-003',
                'name' => 'Interruttore magnetotermico 16A',
                'unit' => 'pz',
                'description' => 'Interruttore di protezione per quadri elettrici.',
                'sale_price' => 18.50,
                'cost_price' => 10.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-004',
                'name' => 'Presa elettrica bipasso',
                'unit' => 'pz',
                'description' => 'Presa civile da incasso.',
                'sale_price' => 8.90,
                'cost_price' => 4.20,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-005',
                'name' => 'Scatola di derivazione 100x100',
                'unit' => 'pz',
                'description' => 'Scatola per connessioni elettriche.',
                'sale_price' => 4.50,
                'cost_price' => 2.10,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-006',
                'name' => 'Tubo corrugato Ø20 mm',
                'unit' => 'm',
                'description' => 'Tubazione flessibile per cavi elettrici.',
                'sale_price' => 0.75,
                'cost_price' => 0.30,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-007',
                'name' => 'Quadro elettrico 24 moduli',
                'unit' => 'pz',
                'description' => 'Centralino per impianto elettrico.',
                'sale_price' => 85.00,
                'cost_price' => 52.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'MAT-008',
                'name' => 'Lampada LED 12W',
                'unit' => 'pz',
                'description' => 'Lampada LED per uso interno.',
                'sale_price' => 6.90,
                'cost_price' => 3.50,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-001',
                'name' => 'Tubo multistrato Ø16 mm',
                'unit' => 'm',
                'description' => 'Tubazione per impianti idrici.',
                'sale_price' => 2.40,
                'cost_price' => 1.20,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-002',
                'name' => 'Raccordo multistrato Ø16 mm',
                'unit' => 'pz',
                'description' => 'Raccordo per tubazioni multistrato.',
                'sale_price' => 3.80,
                'cost_price' => 1.90,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-003',
                'name' => 'Rubinetto a sfera 1/2"',
                'unit' => 'pz',
                'description' => 'Valvola di intercettazione per impianti idrici.',
                'sale_price' => 9.50,
                'cost_price' => 5.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-004',
                'name' => 'Sifone per lavabo',
                'unit' => 'pz',
                'description' => 'Sifone per scarico lavabo.',
                'sale_price' => 12.90,
                'cost_price' => 6.50,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-005',
                'name' => 'Miscelatore lavabo cromato',
                'unit' => 'pz',
                'description' => 'Miscelatore monocomando per lavabo.',
                'sale_price' => 79.00,
                'cost_price' => 43.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'IDR-006',
                'name' => 'Tubo PVC scarico Ø40 mm',
                'unit' => 'm',
                'description' => 'Tubazione per scarichi sanitari.',
                'sale_price' => 3.20,
                'cost_price' => 1.60,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-001',
                'name' => 'Manodopera installazione elettrica',
                'unit' => 'h',
                'description' => 'Installazione e collegamento di componenti elettrici.',
                'sale_price' => 35.00,
                'cost_price' => 20.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-002',
                'name' => 'Manodopera idraulica',
                'unit' => 'h',
                'description' => 'Installazione e riparazione di impianti idraulici.',
                'sale_price' => 40.00,
                'cost_price' => 23.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-003',
                'name' => 'Uscita tecnico per sopralluogo',
                'unit' => 'forfait',
                'description' => 'Sopralluogo tecnico presso il cliente.',
                'sale_price' => 50.00,
                'cost_price' => 25.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-004',
                'name' => 'Manutenzione impianto elettrico',
                'unit' => 'h',
                'description' => 'Controllo e manutenzione ordinaria dell’impianto.',
                'sale_price' => 38.00,
                'cost_price' => 22.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-005',
                'name' => 'Ricerca guasto elettrico',
                'unit' => 'h',
                'description' => 'Diagnosi e individuazione di anomalie elettriche.',
                'sale_price' => 45.00,
                'cost_price' => 25.00,
                'vat_rate' => 22,
            ],
            [
                'code' => 'ATT-006',
                'name' => 'Installazione punto luce',
                'unit' => 'pz',
                'description' => 'Installazione e collegamento di un punto luce.',
                'sale_price' => 55.00,
                'cost_price' => 30.00,
                'vat_rate' => 22,
            ],
        ];

        DB::transaction(function () use ($products, $company): void {
            foreach ($products as $data) {
                Product::query()->updateOrCreate(
                    [
                        'company_id' => $company->id,
                        'code' => $data['code'],
                    ],
                    [
                        ...$data,
                        'is_active' => true,
                    ],
                );
            }
        });

        $this->command?->info(
            count($products) . ' prodotti demo inseriti o aggiornati per '
            . $company->name . '.'
        );
    }
}