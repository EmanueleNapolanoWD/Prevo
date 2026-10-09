<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_application_can_respond_to_a_registered_route(): void
    {
        Route::get('/test-health', fn() => response()->json([
            'status' => 'ok',
        ]));

        $response = $this->get('/test-health');

        $response
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
            ]);
    }

    public function test_testing_environment_configuration(): void
    {
        $this->assertSame('testing', app()->environment());

        dump([
            'environment' => app()->environment(),
            'default_connection' => config('database.default'),
            'mysql_database' => config('database.connections.mysql.database'),
        ]);
    }
}
