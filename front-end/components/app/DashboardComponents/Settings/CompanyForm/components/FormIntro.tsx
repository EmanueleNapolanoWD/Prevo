import styles from "../companyform.module.css";

export default function FormIntro() {
  return (
    <div className={styles.formIntro}>
      <p>
        Gestisci le informazioni che appariranno nei tuoi preventivi e
        documenti.
      </p>
      <div className={styles.progress}>
        <span className={styles.progressDot}></span>
        <span>Profilo in configurazione</span>
      </div>
    </div>
  );
}