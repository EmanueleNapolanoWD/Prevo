"use client";

import { useState, useActionState, startTransition, useEffect } from "react";
import FormIntro from "./components/FormIntro";
import FormActions from "./components/FormActions";
import IdentitySection from "./sections/IdentitySection";
import FiscalSection from "./sections/FiscalSection";
import AddressSection from "./sections/AddressSection";
import ContactsSection from "./sections/ContactsSection";
import type {
  CompanyValues,
  FormStatus,
  CompanyFormState,
} from "@/lib/Utility/Companies/companies.type";
import styles from "./companyform.module.css";
import { updateCompanyDataAction } from "@/lib/Api/Company/company.action";

type CompanyFormProps = {
  slug: string;
  initialValues?: CompanyValues;
};

const SECTIONS = [
  { id: "identita", label: "Identità" },
  { id: "fiscale", label: "Fiscale" },
  { id: "sede", label: "Sede legale" },
  { id: "contatti", label: "Contatti" },
] as const;

const INITIAL_STATE: CompanyFormState = { ok: false };

export default function CompanyForm({
  slug,
  initialValues = {},
}: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateCompanyDataAction.bind(null, slug),
    INITIAL_STATE,
  );
  // true quando l'utente modifica un campo dopo l'ultimo invio
  const [dirty, setDirty] = useState(false);

  const hasError = !state.ok && !!state.message && !dirty;

  const status: FormStatus = isPending
    ? "saving"
    : state.ok && !dirty
      ? "saved"
      : hasError
        ? "error"
        : "idle";

  // porta focus su campo errato
  useEffect(() => {
    const firstInvalid = Object.keys(state.errors ?? {})[0];
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();
  }, [state]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) return;
    const formData = new FormData(e.currentTarget);
    setDirty(false);
    startTransition(() => formAction(formData));
  };

  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      onChange={() => !dirty && setDirty(true)}
      noValidate={false}
    >
      <FormIntro />

      <div className={styles.layout}>
        <nav className={styles.sectionNav} aria-label="Sezioni del form">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.content}>
          <div className={styles.sections}>
            <IdentitySection values={initialValues} />
            <FiscalSection values={initialValues} />
            <AddressSection values={initialValues} />
            <ContactsSection values={initialValues} />
          </div>
          <FormActions status={status} />
        </div>
      </div>
    </form>
  );
}
