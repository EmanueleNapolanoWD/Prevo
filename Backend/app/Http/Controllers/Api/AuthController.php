<?php

namespace App\Http\Controllers\Api;

use App\Domains\Auth\Models\User;
use App\Domains\Companies\Models\Company;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        if (! Auth::guard('web')->attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            throw ValidationException::withMessages(['email' => ['Le credenziali inserite non sono valide.']]);
        }

        // rigenera la sessione per prevenire attacchi di session fixation
        $request->session()->regenerate();

        // user info to return
        $user = $request->user();

        // aggiorna il timestamp dell'ultimo login
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'message' => 'Login effettuato con successo',
            'user' => $user->only([
                'id',
                'name',
                'surname',
                'email',
                'last_login_at',
                'created_at',
                'updated_at',
            ]),
        ]);
    }

    // registrazione
    public function registerUser(Request $request)
    {

        $validated = $request->validate([
            // ACCOUNT
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',

            // Azienda
            'company_name' => ['required', 'string', 'max:150'],
            'legal_name' => ['required', 'string', 'max:255'],
            'vat_number' => ['required', 'string', 'max:20', 'unique:companies,vat_number'],
            'tax_code' => ['required', 'string', 'max:20', 'unique:companies,tax_code'],
            'address' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'size:2'],
            'company_email' => ['required', 'email', 'max:255', 'unique:companies,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:companies,phone'],
            'website' => ['nullable', 'url', 'max:255'],

        ]);

        // TRANSACTION
        $user = DB::transaction(function () use ($validated) {
            // crea l'utente
            $user = User::create([
                'name' => $validated['name'],
                'surname' => $validated['surname'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            // crea l'azienda
            $company = Company::create([
                'name' => $validated['company_name'],
                'legal_name' => $validated['legal_name'],
                'vat_number' => $validated['vat_number'],
                'tax_code' => $validated['tax_code'],
                'address' => $validated['address'],
                'postal_code' => $validated['postal_code'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'email' => $validated['company_email'],
                'phone' => $validated['phone'],
                'website' => $validated['website'],
            ]);

            // associa l'utente all'azienda
            $user->companies()->attach($company);

            // set settings per compny
            $company->companySettings()->create([
                'quote_prefix' => 'PREV',
                'quote_start_number' => 1,
                'default_vat_rate' => 22.00,
                'default_validity_days' => 30,
                'default_currency' => 'EUR',
            ]);

            return $user;
        });

        // login automatico dopo la registrazione
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registrazione effettuata con successo',
            'user' => $user->only([
                'id',
                'name',
                'surname',
                'email',
                'last_login_at',
                'created_at',
                'updated_at',
            ]),
        ], 201);

    }

    // recupero user
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->only([
                'id',
                'name',
                'surname',
                'email',
                'last_login_at',
                'created_at',
                'updated_at',
            ]),
        ]);
    }

    // logout
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout effettuato con successo',
        ]);
    }
}
