import { Kicker } from "@/components/landing/ui/Kicker";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { LANDING } from "@/components/landing/landing.data";

export function FinalCtaSection() {
  const { kicker, titleLine1, titleLine2, subtitle, ctaLabel } =
    LANDING.finalCta;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto lg:max-w-[900px] rounded-2xl prepo-dark shadow-2xl p-8 lg:p-16 text-center">
        <Kicker className="mx-auto text-white/90">{kicker}</Kicker>
        <h2 className="mt-2 text-[34px] font-bold tracking-tight text-white sm:text-[48px]">
          {titleLine1}<br />
          {titleLine2}
        </h2>
        <p className="mt-6 text-white/90 leading-relaxed">{subtitle}</p>
        <div className="mt-10">
          <ButtonLink variant="onDark" href="/sign-up">
            {ctaLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
