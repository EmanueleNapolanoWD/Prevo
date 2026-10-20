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
import { getClientById } from "@/lib/Api/Clients/clients.actions";
import type { ClientAddress } from "@/types/client";
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
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function orDash(value: string | null | undefined, fallback = "Non indicato") {
  return value && value.trim() !== "" ? value : fallback;
}

export default async function DetailClientPage({
  params,
}: DetailClientPageProps) {
  const { slug, id } = await params;
  const result = await getClientById(slug, id);

  const client = "data" in result ? result.data : null;

  if (!client) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState}>
          <strong>Contatto non trovato</strong>
          <span>Il cliente richiesto non esiste o non è più disponibile.</span>
          <Button variant="outline" render={<Link href={`/${slug}/clients`} />}>
            Torna ai contatti
          </Button>
        </div>
      </main>
    );
  }

  const isCompany = client.type === "COMPANY";
  const emails = client.emails ?? [];
  const phones = client.phones ?? [];
  const addresses = client.addresses ?? [];

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
        render={<Link href={`/${slug}/clients/contacts/${client.id}/update`} />}>
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
                  <a href={client.website} target="_blank" rel="noreferrer">
                    {client.website}
                  </a>
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
                {client.default_vat_rate !== null
                  ? `${client.default_vat_rate}%`
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