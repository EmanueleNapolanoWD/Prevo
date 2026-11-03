import type { QuoteCompany } from "@/types/quote";

import { QuoteLogo } from "./QuoteLogo";
import styles from "./QuoteDocumentHeader.module.css";

function formatCompanyAddress(company: QuoteCompany): string {
  const cityLine = [company.postal_code, company.city]
    .filter(Boolean)
    .join(" ");
  const province = company.province ? ` (${company.province})` : "";
  return [company.address, `${cityLine}${province}`]
    .filter(Boolean)
    .join(", ");
}

interface QuoteDocumentHeaderProps {
  company: QuoteCompany | null;
  number: string | null | undefined;
}

/** Intestazione: azienda a sinistra, identità del documento a destra. */
export function QuoteDocumentHeader({
  company,
  number,
}: QuoteDocumentHeaderProps) {
  const companyContacts = [company?.email, company?.phone].filter(Boolean);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {/* Sempre montato: lo stato "logo fallito" resta stabile tra i render */}
        <QuoteLogo
          src={company?.logo_url}
          alt={`Logo di ${company?.name}`}
        />

        {company ? (
          <div className={styles.companyInfo}>
            <strong className={styles.companyName}>
              {company.name ?? null}
            </strong>
            <p className={styles.companyMeta}>
              {formatCompanyAddress(company)}
            </p>
            <p className={styles.companyMeta}>
              P.IVA {company.vat_number}
              {company.tax_code && ` · C.F. ${company.tax_code}`}
            </p>
            {companyContacts.length > 0 && (
              <p className={styles.companyMeta}>
                {companyContacts.join(" · ")}
              </p>
            )}
          </div>
        ) : (
          <strong className={`${styles.companyName} ${styles.muted}`}>
            La tua azienda
          </strong>
        )}
      </div>

      <div className={styles.docMeta}>
        <span className={styles.eyebrow}>PREVENTIVO</span>
        <p className={styles.number}>N. {number || "—"}</p>
      </div>
    </header>
  );
}
