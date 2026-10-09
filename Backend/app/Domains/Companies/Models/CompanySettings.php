<?php

namespace App\Domains\Companies\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CompanySettings extends Model
{
    use HasUuids;


    protected $fillable = [
        'company_id',
        'quote_prefix',
        'quote_start_number',
        'default_vat_rate',
        'default_validity_days',
        'default_currency',
        'default_notes',
        'default_terms'
    ];

    /* 
   ---------------------------------------> RELAZIONI
    */

    //--> Company (1->1) 
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
