"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import styles from "./recent-quotes.module.css";
import { StatusBadge } from "@/components/app/shared/StatusBadge";

interface RecentQuote {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
  validUntil: string | null;
}

interface RecentQuotesProps {
  recent: RecentQuote[] | null | undefined;
}

export default function RecentQuotes({ recent }: RecentQuotesProps) {
  if (!recent || recent.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>Ultimi preventivi</div>
          <div className={styles.description}>
            Nessun preventivo disponibile
          </div>
        </div>
        <div className={styles.empty}>Nessun preventivo</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Ultimi preventivi</div>
        <div className={styles.description}>
          Gli ultimi 8 preventivi modificati
        </div>
      </div>
      <div className={styles.content}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N.</th>
              <th>Cliente</th>
              <th>Stato</th>
              <th>Scadenza</th>
              <th className={styles.textRight}>Importo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.number}</td>
                <td>{quote.customerName}</td>
                <td>
                  <StatusBadge status={quote.status} dot />
                </td>
                <td>
                  {quote.validUntil
                    ? new Date(quote.validUntil).toLocaleDateString("it-IT")
                    : "—"}
                </td>
                <td className={styles.textRight}>
                  {quote.total.toLocaleString("it-IT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
                <td>
                  <Link
                    href={`/${quote.id}/quote`}
                    className={styles.link}
                  >
                    Vedi <ChevronRightIcon className={styles.icon} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


