import type { ReactNode } from "react";
import type { ClientDetail } from "@/types/client";

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
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h5>
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
    <div className="mt-4 space-y-5 rounded-md border p-4 text-sm">
      {/* Intestazione */}
      <div className="space-y-1">
        <h4 className="text-base font-medium">{client.display_name}</h4>
        <p className="text-xs text-muted-foreground">
          {isCompany ? "Azienda" : "Persona"}
          {client.is_public_administration && " · Pubblica Amministrazione"}
        </p>
      </div>

      {/* Anagrafica */}
      <Section title="Anagrafica">
        <dl className="space-y-1">
          {isCompany && (
            <Row label="Ragione sociale">{client.company_name}</Row>
          )}
          <Row label={isCompany ? "Referente" : "Nome"}>{personName}</Row>
          <Row label="Paese">{client.country_code}</Row>
          <Row label="Sito web">
            {client.website && (
              <p
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {client.website}
              </p>
            )}
          </Row>
        </dl>
      </Section>

      {/* Dati fiscali */}
      <Section title="Dati fiscali">
        <dl className="space-y-1">
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
          <p className="text-muted-foreground">Nessuna email disponibile.</p>
        ) : (
          <div className="space-y-2">
            {client.emails.map((e) => (
              <label
                key={e.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="quote-email"
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
          <p className="text-muted-foreground">Nessun telefono disponibile.</p>
        ) : (
          <div className="space-y-2">
            {client.phones.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="quote-phone"
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
          <p className="text-muted-foreground">Nessun indirizzo disponibile.</p>
        ) : (
          <div className="space-y-2">
            {client.addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 ${
                  selectedAddressId === a.id ? "border-primary bg-muted/50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="quote-address"
                  className="mt-1"
                  checked={selectedAddressId === a.id}
                  onChange={() => onAddressChange(a.id)}
                />
                <div>
                  {a.type && (
                    <p className="mb-1 text-xs text-muted-foreground">
                      {a.type}
                    </p>
                  )}
                  <p>{a.street}</p>
                  <p>
                    {[a.postal_code, a.city, a.province && `(${a.province})`]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  {a.country_code && <p>{a.country_code}</p>}
                </div>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* Note */}
      {client.note && (
        <Section title="Note">
          <p className="whitespace-pre-wrap">{client.note}</p>
        </Section>
      )}
    </div>
  );
}
