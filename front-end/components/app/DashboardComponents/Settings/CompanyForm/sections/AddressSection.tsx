import { Landmark } from "lucide-react";
import Section from "../components/Section";
import MultiAddressField from "../components/MultiAddressField";
import type { CompanyValues } from "@/lib/Utility/Companies/companies.type";

export default function AddressSection({ values }: { values: CompanyValues }) {
  return (
    <Section
      id="sede"
      icon={Landmark}
      eyebrow="03 · Sede"
      title="Sedi e indirizzi"
      description="Sede legale e altri indirizzi della tua attività."
    >
      <MultiAddressField initialItems={values.addresses} />
    </Section>
  );
}
