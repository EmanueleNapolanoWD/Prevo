import { QuoteLogo } from "./QuoteLogo";
import styles from "./QuoteDocumentHeader.module.css";
import { Company } from "@/lib/Utility/Companies/companies.type";

function formatCompanyAddress(company: Company): string {
  const address = company.address;

  if (!address) return "";

  const cityLine = [address.postal_code, address.city]
    .filter(Boolean)
    .join(" ");

  const province = address.province ? ` (${address.province})` : "";

  return [address.address, address.address_extra, `${cityLine}${province}`]
    .filter(Boolean)
    .join(", ");
}

/** IBAN raggruppato a blocchi di 4 caratteri: IT60 X054 2811 ... */
function formatIban(iban: string): string {
  return iban
    .replace(/\s+/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Righe informative dell'azienda: quelle senza dati vengono scartate. */
function buildCompanyLines(company: Company): string[] {
  const legalName =
    company.legal_name &&
    company.legal_name.trim().toLowerCase() !==
      company.name?.trim().toLowerCase()
      ? company.legal_name
      : null;

  const fiscalIds = [
    company.vat_number && `P.IVA ${company.vat_number}`,
    company.tax_code && `C.F. ${company.tax_code}`,
  ].filter(Boolean);

  const einvoicing = [
    company.sdi_code && `Codice SDI ${company.sdi_code}`,
    company.pec && `PEC ${company.pec}`,
  ].filter(Boolean);

  const contacts = [
    company.emails?.find((item) => item.is_primary)?.email,
    company.phones?.find((item) => item.is_primary)?.phone,
  ].filter(Boolean);

  return [
    legalName,
    formatCompanyAddress(company),
    fiscalIds.join(" · "),
    company.tax_regime && `Regime fiscale: ${company.tax_regime}`,
    einvoicing.join(" · "),
    contacts.join(" · "),
    company.iban && `IBAN ${formatIban(company.iban)}`,
  ].filter((line): line is string => Boolean(line));
}

interface QuoteDocumentHeaderProps {
  company: Company | null;
  number: string | null | undefined;
}

/** Intestazione: azienda a sinistra, identità del documento a destra. */
export function QuoteDocumentHeader({
  company,
  number,
}: QuoteDocumentHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {/* Sempre montato: lo stato "logo fallito" resta stabile tra i render */}
        <QuoteLogo
          src={company?.logo_url}
          alt={company?.name ? `Logo di ${company.name}` : "Logo aziendale"}
        />

        {company ? (
          <div className={styles.companyInfo}>
            <strong className={styles.companyName}>
              {company.name ?? null}
            </strong>
            {buildCompanyLines(company).map((line) => (
              <p key={line} className={styles.companyMeta}>
                {line}
              </p>
            ))}
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
