"use client";

import { useState } from "react";
import Image from "next/image";

import styles from "./QuoteLogo.module.css";

interface QuoteLogoProps {
  src: string | null | undefined;
  alt: string;
}

/**
 * Unico Client Component del documento: serve lo stato per nascondere il logo
 * quando l'URL firmato è scaduto o l'immagine non carica (onError).
 */
export function QuoteLogo({ src, alt }: QuoteLogoProps) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  console.log("logo: ", src);

  if (!src || src === failedLogo) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={140}
      height={56}
      className={styles.logo}
      onError={() => setFailedLogo(src)}
      unoptimized
    />
  );
}
