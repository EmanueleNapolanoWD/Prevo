import { Mail } from "lucide-react";
import Section from "../components/Section";
import Field from "../components/Fields";
import MultiContactField from "../components/MultiContact";
import type {
  CompanyValues,
} from "@/lib/Utility/Companies/companies.type";
import styles from "../companyform.module.css";

export default function ContactsSection({ values }: { values: CompanyValues }) {
  return (
    <Section
      id="contatti"
      icon={Mail}
      eyebrow="04 · Recapiti"
      title="Contatti"
      description="Come possono raggiungerti clienti e collaboratori."
    >
      <MultiContactField
        name="emails"
        label="Email"
        type="email"
        placeholder="hello@azienda.it"
        initialItems={values.emails}
        required
        addLabel="Aggiungi email"
      />
      <MultiContactField
        name="phones"
        label="Telefono"
        type="tel"
        placeholder="+39 02 0000000"
        initialItems={values.phones}
        addLabel="Aggiungi telefono"
      />
      <Field
        name="website"
        label="Sito web"
        placeholder="https://azienda.it"
        type="url"
        defaultValue={values.website}
        className={styles.full}
      />
    </Section>
  );
}
