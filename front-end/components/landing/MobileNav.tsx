"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "cn";
import { LANDING } from "@/components/landing/landing.data";
import { Container } from "@/components/landing/ui/Container";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        className={cn(
          "lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-prepo-ink hover:bg-prepo-bg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        )}
        onClick={() => setOpen((p) => !p)}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      <nav
        id="mobile-nav"
        aria-label="Navigazione mobile"
        className={cn(
          "lg:hidden fixed top-[76px] left-0 w-full border-b border-[var(--prepo-border)] bg-white shadow-lg z-40",
          "transition-all duration-300 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <Container padding="lg" className="pt-4 pb-8">
          <div className="space-y-3">
            {LANDING.nav.main.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-prepo-ink hover:text-prepo-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <ButtonLink
              variant="ghost"
              href="/login"
              onClick={() => setOpen(false)}
            >
              Accedi
            </ButtonLink>
            <ButtonLink
              variant="primary"
              href="/sign-up"
              onClick={() => setOpen(false)}
            >
              Inizia gratis
            </ButtonLink>
          </div>
        </Container>
      </nav>
    </>
  );
}
