"use client";

import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import styles from "../companyform.module.css";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export default function LogoField({
  initialUrl = null,
}: {
  initialUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeBlob = () => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
  };

  // evita memory leak degli object URL
  useEffect(() => revokeBlob, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const message = !ALLOWED_TYPES.includes(file.type)
      ? "Formato non supportato: usa PNG, JPG o WebP."
      : file.size > MAX_SIZE
        ? "Il file supera i 2 MB."
        : null;

    revokeBlob();
    setError(message);

    if (message) {
      e.target.value = "";
      setPreview(removed ? null : initialUrl);
      return;
    }

    const url = URL.createObjectURL(file);
    blobRef.current = url;
    setPreview(url);
    setRemoved(false);
  };

  const onRemove = () => {
    revokeBlob();
    if (inputRef.current) inputRef.current.value = ""; // svuota anche il file da inviare
    setPreview(null);
    setRemoved(true);
    setError(null);
  };

  return (
    <div className={`${styles.logoField} ${styles.full}`}>
      <div className={styles.logoPreview}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Anteprima logo azienda" />
        ) : (
          <Building2 size={25} />
        )}
      </div>
      <div className={styles.logoCopy}>
        <div>
          <label htmlFor="logo">Logo aziendale</label>
          <p>Riconoscibile e professionale nei tuoi preventivi.</p>
        </div>
        <input
          ref={inputRef}
          id="logo"
          name="logo"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={onChange}
          aria-describedby="logo-hint"
        />
        <span id="logo-hint" className={styles.uploadHint}>
          PNG, JPG o WebP · massimo 2 MB
        </span>
        {error && (
          <span role="alert" className={styles.logoError}>
            {error}
          </span>
        )}
        {preview && (
          <button
            type="button"
            className={styles.textButton}
            onClick={onRemove}
          >
            Rimuovi logo
          </button>
        )}
        {/* segnala al backend di eliminare il logo già salvato */}
        {removed && initialUrl && (
          <input type="hidden" name="remove_logo" value="1" />
        )}
      </div>
    </div>
  );
}
