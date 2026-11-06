import { CheckCircle2, CircleAlert, Save } from "lucide-react";
import type { FormStatus } from "@/lib/Utility/Companies/companies.type";
import styles from "../companyform.module.css";

export default function FormActions({ status }: { status: FormStatus }) {
  const pending = status === "saving";

  return (
    <div className={styles.actions}>
      <div className={styles.status} role="status" aria-live="polite">
        {status === "saved" ? (
          <>
            <CheckCircle2 size={16} /> Modifiche salvate correttamente
          </>
        ) : (
          <>
            <CircleAlert size={16} /> I campi contrassegnati con * sono
            obbligatori
          </>
        )}
      </div>
      <button className={styles.submit} type="submit" disabled={pending}>
        <Save size={16} />
        {pending ? "Salvataggio…" : "Salva modifiche"}
      </button>
    </div>
  );
}
