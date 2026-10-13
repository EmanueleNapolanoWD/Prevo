"use client";

import { useState } from "react";
import { api } from "@/lib/Api/api";
import Navbar from "@/components/app/Navbar/Navbar";

export default function Home() {

  return (
    <>
      <Navbar />
      <main id="home" className="pageContent">
        <p className="eyebrow">Decisioni più chiare, ogni giorno</p>
        <h1>Prevedi il futuro.<br /><em>Costruisci meglio.</em></h1>
        <p className="intro">Prevo trasforma dati complessi in insight semplici, così il tuo team può muoversi con sicurezza.</p>
        <a className="heroCta" href="#contatti">Scopri Prevo <span aria-hidden="true">↗</span></a>
      </main>
    </>
  )
}
