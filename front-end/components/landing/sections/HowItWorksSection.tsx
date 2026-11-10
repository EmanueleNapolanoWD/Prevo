import { cn } from "cn";
import { SectionHeader } from "@/components/landing/ui/SectionHeader";
import { Container } from "@/components/landing/ui/Container";
import { LANDING } from "@/components/landing/landing.data";

export function HowItWorksSection() {
  const { kicker, title, subtitle, steps } = LANDING;

  return (
    <section
      id="come-funziona"
      className="anchor-section py-16 lg:py-24 steps-connector"
      aria-labelledby="come-funziona-title"
    >
      <Container>
        <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
        <ol className="mt-12 grid gap-8 md:gap-12 lg:grid-cols-4 lg:gap-x-10 items-start" role="list">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col items-center gap-3">
              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-prepo-bg text-prepo-primary font-bold text-sm shadow-sm",
                  "border border-prepo-border/40"
                )}
              >
                {step.number}
              </span>
              <h3 className="text-base font-bold text-prepo-ink text-center">
                {step.title}
              </h3>
              <p className="text-prepo-text text-sm leading-relaxed text-center">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
