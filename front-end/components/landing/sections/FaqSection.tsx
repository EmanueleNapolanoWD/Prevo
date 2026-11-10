import { Container } from "@/components/landing/ui/Container";
import { Kicker } from "@/components/landing/ui/Kicker";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { LANDING } from "@/components/landing/landing.data";

export function FaqSection() {
  const { kicker, titleLine1, titleLine2, description, contactLinkLabel } =
    LANDING.faq;

  return (
    <section
      id="faq"
      className="anchor-section py-16 lg:py-24"
      aria-labelledby="faq-title"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="lg:pr-10">
            <Kicker>{kicker}</Kicker>
            <h2 className="mt-2 text-[32px] font-bold tracking-tight text-prepo-ink leading-tight sm:text-[40px]">
              {titleLine1}<br />
              <span className="block">{titleLine2}</span>
            </h2>
            <p className="mt-6 text-prepo-text leading-relaxed">
              {description}
            </p>
            <div className="mt-8">
              <ButtonLink variant="ghost" href="#">
                {contactLinkLabel}
              </ButtonLink>
            </div>
          </div>
          <div className="space-y-3">
            {LANDING.faqs.map((faq) => (
              <details
                key={faq.id}
                defaultOpen={faq.id === "faq-1"}
                className="border-b border-[var(--prepo-border)] pb-4 last:border-b-0"
              >
                <summary
                  className="flex items-center justify-between cursor-pointer list-none text-prepo-ink font-medium"
                >
                  {faq.question}
                  <span
                    className="faq-plus rotate-0 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-prepo-text leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
