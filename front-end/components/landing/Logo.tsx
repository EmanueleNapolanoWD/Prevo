import Link from "next/link";
import { cn } from "cn";

export interface LogoProps {
  className?: string;
  /** Colore del testo "prevo" (default: ink, usare "white" su sfondo scuro) */
  textColor?: "ink" | "white";
}

export function Logo({ className, textColor = "ink" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Prevo home"
      className={cn(
        "inline-flex items-center gap-2 text-decoration-none",
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-prepo-primary">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10 3v12" />
          <path d="M10 15h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-5" />
        </svg>
      </div>
      <span
        className={cn(
          "font-bold text-[17px] tracking-tight",
          textColor === "white" ? "text-white" : "text-prepo-ink"
        )}
      >
        prevo
      </span>
    </Link>
  );
}
