"use client";

import styles from "./quote-form.module.css";
import InfoClient from "./InfoClient/InfoClient";

export default function QuoteForm() {
  return (
    <>
      {/* aspetto template preventivo */}
      <div>Scelta template da settings</div>

      {/* info cliente */}
      <div>
        <InfoClient />
      </div>

      {/* voci preventivo */}
      <div>
        {/* item quote */}
        <div>
          <div>descrizione quantità unità prezzo sconto</div>
          <div>
            <button>Inserisci Voce</button>
            <button>Recupera da prodotti</button>
          </div>
        </div>
      </div>

      {/* tasse */}
      <div>
        <div>iva valido fino a</div>
        <div>maggiorazione sconto</div>
        <div>inserimento di note</div>
      </div>
    </>
  );
}
