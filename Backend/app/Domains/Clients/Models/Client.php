<?php

namespace App\Domains\Clients\Models;

use App\Domains\Companies\Models\Company;
use App\Domains\Quotes\Models\Quote;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasUuids, SoftDeletes;
    
    protected $fillable = [
        'company_id',
        'type',
        'name',
        'surname',
        'company_name',        
        'email',
        'phone',
        'address',
        'postal_code',
        'city',
        'province',
        'tax_code',
        'vat_number',
        'note',
    ];

    /* |-------------------------------------------------------------------------- | RELAZIONI |-------------------------------------------------------------------------- */

    // Collegamento con il modello Company
    public function company(): BelongsTo 
    {
        return $this->belongsTo(Company::class);
    }

    // Collegamento con il modello Quote
    public function quotes(): HasMany 
    {
        return $this->hasMany(Quote::class);
    }
}
