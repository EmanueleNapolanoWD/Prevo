import Link from "next/link";
import { cn } from "cn";
import { LANDING } from "@/components/landing/landing.data";
import { Logo } from "@/components/landing/Logo";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { Container } from "@/components/landing/ui/Container";
import MobileNav from "@/components/landing/MobileNav";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[var(--prepo-border)] bg-white/70 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90"
    >
      <Container padding="lg">
        <div className="flex h-[76px] items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-1 lg:gap-6">
            <nav aria-label="Principale" className="hidden lg:flex items-center gap-8 text-sm font-medium">
              {LANDING.nav.main.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={cn(
                    "text-prepo-ink transition-colors",
                    link.href === "/" ? "text-prepo-primary" : ""
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              <ButtonLink variant="ghost" href="/login">
                Accedi
              </ButtonLink>
              <ButtonLink variant="primary" href="/sign-up">
                Inizia gratis
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
      <MobileNav />
    </header>
  );
}
