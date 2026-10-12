"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState("");

  async function testCsrf() {
    try {
      const response = await api.get("/sanctum/csrf-cookie");
      setResult(`Richiesta riuscita: HTTP ${response.status}`);
    } catch (error) {
      console.error(error);
      setResult("Errore: controlla la console e la scheda Network.");
    }
  }

  return (
    <main>
      <h1>PREVO - Test Sanctum</h1>
      <button onClick={testCsrf}>
        Verifica connessione CSRF
      </button>
      <p>{result}</p>
    </main>
  );
}