import { FileText } from "lucide-react";
import Section from "../components/Section";
import Field from "../components/Fields";
import type { CompanyValues } from "@/lib/Utility/Companies/companies.type";
import styles from "../companyform.module.css";

export default function FiscalSection({ values }: { values: CompanyValues }) {
  return (
    <Section
      id="fiscale"
      icon={FileText}
      eyebrow="02 · Fiscale"
      title="Dati fiscali"
      description="Dati necessari per documenti e fatturazione elettronica."
    >
      <Field
        name="vat_number"
        label="Partita IVA"
        placeholder="IT 00000000000"
        defaultValue={values.vat_number}
        className={styles.emphasis}
      />
      <Field
        name="tax_code"
        label="Codice fiscale"
        placeholder="RSSMRA80A01H501U"
        defaultValue={values.tax_code}
        className={styles.emphasis}
      />
      <Field
        name="country_code"
        label="Paese"
        placeholder="IT"
        defaultValue={values.country_code}
        maxLength={2}
        required
      />
      <Field
        name="tax_regime"
        label="Regime fiscale"
        placeholder="Ordinario"
        defaultValue={values.tax_regime}
      />
      <Field
        name="sdi_code"
        label="Codice SDI"
        placeholder="0000000"
        defaultValue={values.sdi_code}
        maxLength={7}
      />
      <Field
        name="pec"
        label="PEC"
        placeholder="nome@pec.it"
        type="email"
        defaultValue={values.pec}
      />
      <Field
        name="rea_office"
        label="Ufficio REA"
        placeholder="MI"
        defaultValue={values.rea_office}
        maxLength={2}
      />
      <Field
        name="rea_number"
        label="Numero REA"
        placeholder="1234567"
        defaultValue={values.rea_number}
      />
      <Field
        name="share_capital"
        label="Capitale sociale"
        placeholder="€ 10.000"
        inputMode="decimal"
        defaultValue={values.share_capital}
      />
      <Field
        name="ateco_code"
        label="Codice ATECO"
        placeholder="62.01.00"
        defaultValue={values.ateco_code}
      />
      <Field
        name="iban"
        label="IBAN"
        placeholder="IT00 A000 0000 0000 0000 0000 000"
        defaultValue={values.iban}
        className={styles.full}
      />
    </Section>
  );
}
