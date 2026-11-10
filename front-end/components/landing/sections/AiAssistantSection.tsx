import { Container } from "@/components/landing/ui/Container";
import { Kicker } from "@/components/landing/ui/Kicker";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { LANDING } from "@/components/landing/landing.data";
import { AiChatMockup } from "./AiChatMockup";

export function AiAssistantSection() {
  const { ai } = LANDING;

  return (
    <section
      id="assistente-ai"
      className="anchor-section py-16 lg:py-24"
      aria-labelledby="ai-title"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="rounded-2xl border border-[var(--prepo-border)] bg-prepo-bg p-8 lg:p-12">
            <Kicker>{ai.kicker}</Kicker>
            <h2
              className="mt-2 text-[32px] font-bold tracking-tight text-prepo-ink leading-tight sm:text-[40px]"
            >
              {ai.titleLine1}<br />
              <span className="block text-prepo">{ai.titleLine2}</span>
            </h2>
            <p className="mt-6 text-prepo-text leading-relaxed">
              {ai.description}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-prepo-text">
              {ai.checks.map((check) => (
                <li key={check} className="flex items-start gap-3">
                  <span
                    className="flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-prepo-primary text-white text-[10px] font-bold mt-0.5"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {check}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ButtonLink variant="secondary" href="#">
                {ai.linkLabel}
              </ButtonLink>
            </div>
          </div>
          <div>
            <AiChatMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
