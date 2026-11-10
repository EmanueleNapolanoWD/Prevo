import { SectionHeader } from "@/components/landing/ui/SectionHeader";
import { Container } from "@/components/landing/ui/Container";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { LANDING } from "@/components/landing/landing.data";
import { cn } from "cn";

export function PricingSection() {
  const { kicker, title, subtitle, note } = LANDING.pricing;
  const plans = LANDING.plans;

  return (
    <section
      id="prezzi"
      className="anchor-section py-16 lg:py-24 prepo-bg"
      aria-labelledby="prezzi-title"
    >
      <Container>
        <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
        <div className="mt-14 grid gap-8 lg:gap-10 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlighted = plan.variant === "highlighted";
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-xl border p-6 shadow-sm",
                  highlighted
                    ? "border-prepo-primary bg-white shadow-xl prepo-shadow lg:-mt-2 z-10"
                    : "border-[var(--prepo-border)] bg-white hover:shadow-md transition-shadow duration-200"
                )}
              >
                {highlighted && plan.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-prepo-primary text-white text-[10px] font-bold px-2 py-0.5 mb-4">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-prepo-ink mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-prepo-text mb-3">{plan.tagline}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-prepo-text mb-5">
                  {plan.intro}
                </p>
                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-prepo-text">
                      <span className="text-prepo" aria-hidden="true">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  variant={highlighted ? "primary" : "secondary"}
                  href={plan.href}
                  className="w-full"
                >
                  {plan.cta}
                </ButtonLink>
              </div>
            );
          })}
        </div>
        <p className="mt-12 text-center text-prepo-text">
          {note}
        </p>
      </Container>
    </section>
  );
}
