import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getClientById,
  isErrorResult,
} from "@/lib/Api/Clients/clients.server";
import type { ClientAddress } from "@/lib/Utility/Clients/clients.types";
import styles from "./page.module.css";

interface DetailClientPageProps {
  params: Promise<{ slug: string; id: string }>;
}

const ADDRESS_TYPES: Record<ClientAddress["type"], string> = {
  BILLING: "Fatturazione",
  SHIPPING: "Spedizione",
  SITE: "Sede / cantiere",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  // Il fuso è fissato: sul server l'ora altrimenti uscirebbe in UTC
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(date);
}

function orDash(value: string | null | undefined, fallback = "Non indicato") {
  return value && value.trim() !== "" ? value : fallback;
}

/** Link sicuro: solo http/https (niente "javascript:") e protocollo aggiunto se manca. */
function toWebUrl(value: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default async function DetailClientPage({
  params,
}: DetailClientPageProps) {
  const { slug, id } = await params;
  const result = await getClientById(slug, id);

  if (isErrorResult(result)) {
    const isMissing = result.status === 404;

    return (
      <main className={styles.page}>
        <div className={styles.errorState} role="alert">
          <strong>
            {isMissing ? "Contatto non trovato" : "Impossibile caricare il contatto"}
          </strong>
          <span>
            {isMissing
              ? "Il cliente richiesto non esiste o non è più disponibile."
              : result.message}
          </span>
          <Button variant="outline" render={<Link href={`/${slug}/clients`} />}>
            Torna ai contatti
          </Button>
        </div>
      </main>
    );
  }

  const client = result;
  const isCompany = client.type === "COMPANY";
  const emails = client.emails ?? [];
  const phones = client.phones ?? [];
  const addresses = client.addresses ?? [];
  const websiteUrl = client.website ? toWebUrl(client.website) : null;
  const vatRate = client.default_vat_rate;

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href={`/${slug}/clients`}>
        <ArrowLeft />
        Torna ai contatti
      </Link>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.heroIcon}>
            {isCompany ? <Building2 /> : <UserRound />}
          </div>
          <div>
            <div className={styles.eyebrow}>Scheda cliente</div>
            <h1>{client.display_name}</h1>
            <div className={styles.meta}>
              <Badge variant="secondary">
                {isCompany ? "Azienda" : "Persona"}
              </Badge>
              {client.is_public_administration && (
                <Badge variant="outline">Pubblica amministrazione</Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          render={
            <Link href={`/${slug}/clients/contacts/${client.id}/update`} />
          }
        >
          Modifica cliente
        </Button>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Informazioni principali</h2>
            <p>Dati identificativi</p>
          </div>
          <dl className={styles.details}>
            {isCompany ? (
              <div>
                <dt>Ragione sociale</dt>
                <dd>{orDash(client.company_name)}</dd>
              </div>
            ) : (
              <>
                <div>
                  <dt>Titolo</dt>
                  <dd>{orDash(client.salutation, "—")}</dd>
                </div>
                <div>
                  <dt>Nome</dt>
                  <dd>{orDash(client.name)}</dd>
                </div>
                <div>
                  <dt>Cognome</dt>
                  <dd>{orDash(client.surname)}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Sito web</dt>
              <dd>
                {client.website ? (
                  websiteUrl ? (
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      {client.website}
                    </a>
                  ) : (
                    client.website
                  )
                ) : (
                  "Non indicato"
                )}
              </dd>
            </div>
            <div>
              <dt>PEC</dt>
              <dd>
                {client.pec ? (
                  <a href={`mailto:${client.pec}`}>{client.pec}</a>
                ) : (
                  "Non indicata"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Dati fiscali</h2>
            <p>Fatturazione e pagamenti</p>
          </div>
          <dl className={styles.details}>
            <div>
              <dt>Paese</dt>
              <dd>{client.country_code}</dd>
            </div>
            <div>
              <dt>Codice fiscale</dt>
              <dd>{orDash(client.tax_code)}</dd>
            </div>
            <div>
              <dt>Partita IVA</dt>
              <dd>{orDash(client.vat_number, "Non indicata")}</dd>
            </div>
            <div>
              <dt>Codice SDI</dt>
              <dd>{orDash(client.sdi_code)}</dd>
            </div>
            <div>
              <dt>Aliquota IVA predefinita</dt>
              <dd>
                {/* Laravel può restituire "22.00": Number() la riporta a 22 */}
                {vatRate !== null && vatRate !== undefined
                  ? `${Number(vatRate)}%`
                  : "Non indicata"}
              </dd>
            </div>
            <div>
              <dt>Termini di pagamento</dt>
              <dd>{orDash(client.payment_terms, "Non indicati")}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Contatti</h2>
            <p>Email e telefoni</p>
          </div>
          <div className={styles.contactList}>
            {emails.map((email) => (
              <div className={styles.contact} key={email.id}>
                <Mail />
                <div>
                  <span>
                    {email.label ?? "Email"}
                    {email.is_primary && " · principale"}
                  </span>
                  <a href={`mailto:${email.email}`}>{email.email}</a>
                </div>
              </div>
            ))}
            {phones.map((phone) => (
              <div className={styles.contact} key={phone.id}>
                <Phone />
                <div>
                  <span>
                    {phone.label ?? "Telefono"}
                    {phone.is_primary && " · principale"}
                  </span>
                  <a href={`tel:${phone.phone}`}>{phone.phone}</a>
                </div>
              </div>
            ))}
            {!emails.length && !phones.length && (
              <p className={styles.muted}>Nessun recapito indicato.</p>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Indirizzi</h2>
            <p>Sedi e indirizzi di fatturazione</p>
          </div>
          {addresses.length > 0 ? (
            <div className={styles.contactList}>
              {addresses.map((address) => (
                <div className={styles.contact} key={address.id}>
                  <MapPin />
                  <div>
                    <span>
                      {ADDRESS_TYPES[address.type]}
                      {address.is_default && " · predefinito"}
                    </span>
                    <div>
                      {address.street}
                      {address.street_number && `, ${address.street_number}`}
                    </div>
                    {address.extra && <div>{address.extra}</div>}
                    <div>
                      {address.postal_code} {address.city}
                      {address.province && ` (${address.province})`}
                      {" · "}
                      {address.country_code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <MapPin />
              <span>Nessun indirizzo registrato</span>
            </div>
          )}
        </section>

        {client.note && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Note</h2>
              <p>Annotazioni interne</p>
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{client.note}</p>
          </section>
        )}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Attività record</h2>
            <p>Informazioni di sistema</p>
          </div>
          <div className={styles.activity}>
            <CalendarDays />
            <div>
              <span>Creato il</span>
              <strong>{formatDate(client.created_at)}</strong>
            </div>
            <div>
              <span>Ultimo aggiornamento</span>
              <strong>{formatDate(client.updated_at)}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}