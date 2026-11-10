import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { BenefitsSection } from "@/components/landing/sections/BenefitsSection";
import { FeaturesSection } from "@/components/landing/sections/FeaturesSection";
import { AiAssistantSection } from "@/components/landing/sections/AiAssistantSection";
import { HowItWorksSection } from "@/components/landing/sections/HowItWorksSection";
import { PricingSection } from "@/components/landing/sections/PricingSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { FinalCtaSection } from "@/components/landing/sections/FinalCtaSection";
import { Footer } from "@/components/landing/sections/Footer";
import { LANDING } from "@/components/landing/landing.data";

export const metadata: Metadata = {
  title: "Prevo – Crea preventivi professionali, semplicemente",
  description:
    "Crea preventivi professionali, gestisci clienti e monitora l'andamento della tua attività in un'unica piattaforma. Inizia gratis, senza carta di credito.",
  openGraph: {
    title: "Prevo – Crea preventivi professionali, semplicemente",
    description:
      "Crea preventivi professionali, gestisci clienti e monitora l'andamento della tua attività in un'unica piattaforma. Inizia gratis, senza carta di credito.",
    type: "website",
    locale: "it_IT",
  },
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <BenefitsSection />
        <FeaturesSection />
        <AiAssistantSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <Footer />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: LANDING.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
