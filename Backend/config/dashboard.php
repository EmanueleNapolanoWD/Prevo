<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Soglie per i "to-do" della dashboard
    |--------------------------------------------------------------------------
    */

    'todos' => [

        // Preventivi in scadenza: giorni residui entro cui scadono
        'expiring_days' => 7,

        // Preventivi senza risposta: giorni dall'invio senza risposta
        'no_reply_days' => 7,

        // Bozze ferme: giorni dall'ultimo aggiornamento
        'stale_draft_days' => 5,

        // Numero massimo di elementi restituiti
        'limit' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Range temporali disponibili per i KPI e i grafici
    |--------------------------------------------------------------------------
    */

    'ranges' => ['7d', '30d', '90d'],

    'default_range' => '30d',

];