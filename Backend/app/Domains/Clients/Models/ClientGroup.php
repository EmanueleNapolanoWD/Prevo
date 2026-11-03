<?php

namespace App\Domains\Clients\Models;

use App\Domains\Companies\Models\Company;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ClientGroup extends Model
{
    use HasUuids;

    protected $table = 'clients_group';

    protected $fillable = [
        'name',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(
            Client::class,
            'client_client_group',
            'client_group_id',
            'client_id'
        );
    }
}
