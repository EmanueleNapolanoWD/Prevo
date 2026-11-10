import { LANDING } from "@/components/landing/landing.data";
import { Container } from "@/components/landing/ui/Container";
import { Kicker } from "@/components/landing/ui/Kicker";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { DashboardPreview } from "@/components/landing/sections/DashboardPreview";

export function HeroSection() {
  const { hero } = LANDING;

  return (
    <section className="pt-20 pb-16 lg:pt-24 lg:pb-28">
      <Container>
        <div className="text-center lg:max-w-2xl lg:mx-auto">
          <Kicker>{hero.kicker}</Kicker>
          <h1
            className="mt-2 text-[40px] font-bold tracking-tight text-prepo-ink leading-[1.02] sm:text-[56px] lg:text-[64px]"
          >
            <span className="block">{hero.titleLine1}</span>
            <br />
            <span className="block text-prepo">{hero.titleLine2}</span>
          </h1>
          <p className="mt-6 text-prepo-text text-lg leading-relaxed sm:text-xl">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:justify-center lg:justify-center">
            <ButtonLink variant="primary" href={hero.ctaPrimary.href}>
              {hero.ctaPrimary.label}
            </ButtonLink>
            <ButtonLink variant="ghost" href={hero.ctaSecondary.href}>
              {hero.ctaSecondary.label}
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-prepo-text">{hero.microcopy}</p>
        </div>

        <div className="mt-12 lg:mt-16 text-center lg:text-left">
          <Kicker>{hero.dashboardKicker}</Kicker>
          <div className="mt-4">
            <DashboardPreview />
          </div>
          <p className="mt-6 text-center lg:text-left text-sm text-prepo-text">
            {hero.dashboardCaption}
          </p>
        </div>
      </Container>
    </section>
  );
}
