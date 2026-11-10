import { cn } from "cn";
import { SectionHeader } from "@/components/landing/ui/SectionHeader";
import { Container } from "@/components/landing/ui/Container";
import { Icon } from "@/components/landing/ui/Icon";
import { LANDING } from "@/components/landing/landing.data";

export function BenefitsSection() {
  const { kicker, title, subtitle, items } = LANDING.benefits;

  return (
    <section
      id="benefici"
      className="anchor-section py-16 lg:py-24"
      aria-labelledby="benefici-title"
    >
      <Container>
        <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                "rounded-xl border border-[var(--prepo-border)] bg-white p-6 shadow-sm",
                "hover:border-prepo-primary hover:shadow-md transition-colors duration-200"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-prepo-bg text-prepo-primary mb-4">
                <Icon name={item.icon} className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-prepo-ink mb-2">
                {item.title}
              </h3>
              <p className="text-prepo-text text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
