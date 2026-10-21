"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { ClientDetail } from "@/types/client";
import type { QuoteItem } from "@/types/quote";
import InfoClient, { type QuoteContact } from "./InfoClient/InfoClient";
import QuoteItems from "./QuoteItems/QuoteItems";
import styles from "./quote-form.module.css";

export default function QuoteForm() {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [contact, setContact] = useState<QuoteContact>({
    email: null,
    phone: null,
    address: null,
  });
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);

  return (
    <div className={styles.form}>
      {/* aspetto template preventivo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Template</h3>
        <p className={styles.placeholder}>Scelta template da settings</p>
      </section>

      {/* info cliente */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cliente</h3>
        <InfoClient onSelectClient={setClient} onContactChange={setContact} />
      </section>

      {/* dati preventivo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Dati preventivo</h3>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="quote-number" className={styles.label}>
              Numero preventivo
            </label>
            <Input
              id="quote-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="quote-title" className={styles.label}>
              Oggetto preventivo
            </label>
            <Input
              id="quote-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* voci preventivo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Voci</h3>
        <QuoteItems items={items} onItemsChange={setItems} />
      </section>

      {/* tasse */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tasse e note</h3>
        <p className={styles.placeholder}>iva · valido fino a</p>
        <p className={styles.placeholder}>maggiorazione · sconto</p>
        <p className={styles.placeholder}>inserimento di note</p>
      </section>
    </div>
  );
}