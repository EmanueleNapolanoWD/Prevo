import type { ReactNode } from "react";
import type { ClientDetail } from "@/types/client";
import styles from "./info-client.module.css";

type ContactId = string | number;

interface InfoClientDetailProps {
  client: ClientDetail;
  selectedEmailId: ContactId | null;
  selectedPhoneId: ContactId | null;
  selectedAddressId: ContactId | null;
  onEmailChange: (id: ContactId) => void;
  onPhoneChange: (id: ContactId) => void;
  onAddressChange: (id: string) => void;
}

// Riga etichetta/valore: non viene mostrata se il valore è vuoto
function Row({ label, children }: { label: string; children?: ReactNode }) {
  if (children === null || children === undefined || children === "") {
    return null;
  }
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={styles.rowValue}>{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h5 className={styles.sectionTitle}>{title}</h5>
      {children}
    </section>
  );
}

export default function InfoClientDetail({
  client,
  selectedEmailId,
  selectedPhoneId,
  selectedAddressId,
  onAddressChange,
  onEmailChange,
  onPhoneChange,
}: InfoClientDetailProps) {
  const isCompany = client.type === "COMPANY";
  const personName = [client.salutation, client.name, client.surname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.card}>
      {/* Intestazione */}
      <div className={styles.header}>
        <h4 className={styles.headerTitle}>{client.display_name}</h4>
        <p className={styles.headerMeta}>
          {isCompany ? "Azienda" : "Persona"}
          {client.is_public_administration && " · Pubblica Amministrazione"}
        </p>
      </div>

      {/* Anagrafica */}
      <Section title="Anagrafica">
        <dl className={styles.list}>
          {isCompany && <Row label="Ragione sociale">{client.company_name}</Row>}
          <Row label={isCompany ? "Referente" : "Nome"}>{personName}</Row>
          <Row label="Paese">{client.country_code}</Row>
          <Row label="Sito web">
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {client.website}
              </a>
            )}
          </Row>
        </dl>
      </Section>

      {/* Dati fiscali */}
      <Section title="Dati fiscali">
        <dl className={styles.list}>
          <Row label="Codice fiscale">{client.tax_code}</Row>
          <Row label="Partita IVA">{client.vat_number}</Row>
          <Row label="PEC">{client.pec}</Row>
          <Row label="Codice SDI">{client.sdi_code}</Row>
          <Row label="Aliquota IVA">
            {client.default_vat_rate && `${Number(client.default_vat_rate)}%`}
          </Row>
          <Row label="Pagamento">{client.payment_terms}</Row>
        </dl>
      </Section>

      {/* Email */}
      <Section title="Email per il preventivo">
        {client.emails.length === 0 ? (
          <p className={styles.empty}>Nessuna email disponibile.</p>
        ) : (
          <div className={styles.choices}>
            {client.emails.map((e) => (
              <label key={e.id} className={styles.choice}>
                <input
                  type="radio"
                  name="quote-email"
                  className={styles.radio}
                  checked={selectedEmailId === e.id}
                  onChange={() => onEmailChange(e.id)}
                />
                <span>{e.email}</span>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* Telefono */}
      <Section title="Telefono per il preventivo">
        {client.phones.length === 0 ? (
          <p className={styles.empty}>Nessun telefono disponibile.</p>
        ) : (
          <div className={styles.choices}>
            {client.phones.map((p) => (
              <label key={p.id} className={styles.choice}>
                <input
                  type="radio"
                  name="quote-phone"
                  className={styles.radio}
                  checked={selectedPhoneId === p.id}
                  onChange={() => onPhoneChange(p.id)}
                />
                <span>{p.phone}</span>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* Indirizzi */}
      <Section title="Indirizzo per il preventivo">
        {client.addresses.length === 0 ? (
          <p className={styles.empty}>Nessun indirizzo disponibile.</p>
        ) : (
          <div className={styles.choices}>
            {client.addresses.map((a) => (
              <label
                key={a.id}
                className={`${styles.choice} ${styles.choiceTop}`}
              >
                <input
                  type="radio"
                  name="quote-address"
                  className={styles.radio}
                  checked={selectedAddressId === a.id}
                  onChange={() => onAddressChange(a.id)}
                />
                <div>
                  {a.type && <p className={styles.addressType}>{a.type}</p>}
                  <p className={styles.addressLine}>{a.street}</p>
                  <p className={styles.addressLine}>
                    {[a.postal_code, a.city, a.province && `(${a.province})`]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  {a.country_code && (
                    <p className={styles.addressLine}>{a.country_code}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* Note */}
      {client.note && (
        <Section title="Note">
          <p className={styles.note}>{client.note}</p>
        </Section>
      )}
    </div>
  );
}