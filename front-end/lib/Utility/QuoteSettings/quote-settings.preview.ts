// quote-preview-data.ts
import type { QuoteCompany, QuoteItem } from "@/types/quote"; // o il path corretto dei tuoi tipi
import type { QuoteContact } from "@/components/app/DashboardComponents/Quotes/hooks/useQuoteForm";
import type { ClientDetail } from "@/lib/Utility/Clients/clients.types";

export const PREVIEW_COMPANY: QuoteCompany = {
  name: "La Tua Azienda S.r.l.",
  legal_name: "La Tua Azienda S.r.l. Unipersonale",
  vat_number: "IT12345678901",
  tax_code: "12345678901",
  tax_regime: "Ordinario",
  sdi_code: "M5UXCR1",
  pec: "azienda@pec.it",
  iban: "IT60X0542811101000000123456",
  address: "Via Roma 1",
  postal_code: "00100",
  city: "Roma",
  province: "RM",
  email: "info@latuaazienda.it",
  phone: "+39 06 1234567",
  logo_url: null,
};

export const PREVIEW_CLIENT = {
  id: "client-sample",
  type: "COMPANY",
  display_name: "Cliente Esempio SpA",
  contact: {
    email: "cliente@esempio.it",
    phone: "+39 02 1234567",
    address: "Corso Italia 20, 20122 Milano (MI)",
  },
} as unknown as ClientDetail;

export const PREVIEW_CONTACT: QuoteContact = {
  address: "Corso Italia 20, 20122 Milano (MI)",
  email: "cliente@esempio.it",
  phone: "+39 02 1234567",
};

export const PREVIEW_ITEMS: QuoteItem[] = [
  {
    id: "1",
    product_id: null,
    name: "Consulenza",
    description: "Consulenza e analisi requisiti",
    quantity: 1,
    unit: "pz",
    unit_price: 500,
    discount_type: "percentage",
    discount_value: 0,
  },
  {
    id: "2",
    product_id: null,
    name: "Sviluppo",
    description: "Sviluppo e configurazione piattaforma",
    quantity: 5,
    unit: "ore",
    unit_price: 120,
    discount_type: "percentage",
    discount_value: 0,
  },
];

export const PREVIEW_MONEY = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

export const PREVIEW_HEADER_TEXT = {
  title: "Preventivo di esempio",
  description:
    "Questo è un preventivo di prova per visualizzare le impostazioni.",
} as const;
