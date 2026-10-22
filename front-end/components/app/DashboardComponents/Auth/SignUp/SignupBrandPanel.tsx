import { Palette, Receipt, Zap } from "lucide-react";
import styles from "@/components/app/Forms/signUpForm/signup-form.module.css";

const FEATURES = [
  {
    icon: Zap,
    title: "Preventivi in pochi minuti",
    text: "Clienti, prodotti e totali si compilano senza fatica.",
  },
  {
    icon: Palette,
    title: "Il tuo stile",
    text: "Scegli template e colori per documenti coerenti con il tuo brand.",
  },
  {
    icon: Receipt,
    title: "Numerazione e IVA automatiche",
    text: "Prefisso, progressivo e aliquota partono dalle tue impostazioni.",
  },
] as const;

export default function SignupBrandPanel() {
  return (
    <aside className={styles.brandPanel}>
      <div className={styles.brandInner}>
        <span className={styles.brandLogo}>PREVO</span>

        <div className={styles.brandCopy}>
          <h1 className={styles.brandTitle}>
            Preventivi professionali, <em>senza fatica.</em>
          </h1>
          <p className={styles.brandText}>
            Crea il tuo account e configura la tua azienda in pochi passaggi.
          </p>
        </div>

        <ul className={styles.features}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className={styles.feature}>
              <span className={styles.featureIcon}>
                <Icon aria-hidden />
              </span>
              <div>
                <p className={styles.featureTitle}>{title}</p>
                <p className={styles.featureText}>{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className={styles.brandFooter}>
          Configurazione guidata in 5 passaggi
        </p>
      </div>
    </aside>
  );
}




