import { Building2 } from "lucide-react";
import Section from "../components/Section";
import Field from "../components/Fields";
import LogoField from "../components/LogoFields";
import type { CompanyValues } from "@/lib/Utility/Companies/companies.type";

export default function IdentitySection({ values }: { values: CompanyValues }) {
  return (
    <Section
      id="identita"
      icon={Building2}
      eyebrow="01 · Identità"
      title="Anagrafica aziendale"
      description="Le informazioni principali della tua azienda."
    >
      <LogoField initialUrl={values.logo_url} />
      <Field
        name="name"
        label="Nome commerciale"
        placeholder="Es. Studio Rossi"
        defaultValue={values.name}
        required
      />
      <Field
        name="legal_name"
        label="Ragione sociale"
        placeholder="Es. Rossi S.r.l."
        defaultValue={values.legal_name}
      />
      <Field
        name="legal_form"
        label="Forma giuridica"
        placeholder="Es. S.r.l."
        defaultValue={values.legal_form}
      />
    </Section>
  );
}
