import type { ReactNode } from "react";

import styles from "./QuoteSectionTitle.module.css";

/** Titoletto di sezione (h3 maiuscoletto nel colore accent). */
export function QuoteSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}
