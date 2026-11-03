<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_two_plus_two_equals_four(): void
    {
        $this->assertSame(4, 2 + 2);
    }
}
