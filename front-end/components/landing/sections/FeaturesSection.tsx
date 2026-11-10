import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/landing/ui/SectionHeader";
import { Container } from "@/components/landing/ui/Container";
import { Icon } from "@/components/landing/ui/Icon";
import { LANDING } from "@/components/landing/landing.data";

export function FeaturesSection() {
  const { kicker, title, subtitle, features } = LANDING;

  return (
    <section
      id="funzionalita"
      className="anchor-section py-16 lg:py-24 prepo-bg"
      aria-labelledby="funzionalita-title"
    >
      <Container>
        <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={cn(
                "rounded-xl border border-[var(--prepo-border)] bg-white p-6 shadow-sm",
                "hover:border-prepo-primary hover:shadow-md transition-colors duration-200"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-prepo-bg text-prepo-primary mb-4">
                <Icon name={feature.icon} className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-prepo-ink mb-2">
                {feature.title}
              </h3>
              <p className="text-prepo-text text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <a
                href="#"
                className="text-xs font-medium text-prepo-primary underline underline-offset-2 hover:underline-offset-4"
              >
                {feature.link} <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
