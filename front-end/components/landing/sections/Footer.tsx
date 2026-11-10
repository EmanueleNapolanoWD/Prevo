import Link from "next/link";
import { Logo } from "@/components/landing/Logo";
import { Container } from "@/components/landing/ui/Container";
import { LANDING } from "@/components/landing/landing.data";

export function Footer() {
  const { tagline, groups, legal } = LANDING.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-prepo-dark">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:pr-8">
            <Logo textColor="white" className="w-fit" />
            <p className="mt-4 text-white/80 text-sm">{tagline}</p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-white font-semibold text-sm uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-10 border-white/10" />
        <div className="flex flex-col lg:flex-row justify-between gap-4 text-xs text-white/50">
          <p>
            © {year} Prevo. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-6">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
