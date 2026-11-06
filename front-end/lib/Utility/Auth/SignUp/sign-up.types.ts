import { SignUpFormValues } from "@/lib/Validations/auth";
import { LucideIcon } from "lucide-react";

export type FieldErrors = Partial<Record<keyof SignUpFormValues, string>>;
export type SelectOption = { value: string; label: string };
export type StepId = "user" | "company" ;

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  legal_name: string;
  country_code: string;
  vat_number: string | null;
  tax_code: string | null;
  pec: string | null;
  iban: string | null;
  website: string | null;
  phones: Array<{
    phone: string;
    is_primary: boolean;
    label: string;
  }>;
  emails: Array<{
    email: string;
    is_primary: boolean;
    label: string;
  }>;
  addresses: Array<{
    address: string;
    city: string;
    postal_code: string;
    province: string;
    country_code: string;
    is_primary: boolean;
    label: string;
  }>;
}

export interface StepConfig {
  id: StepId;
  title: string;
  heading: string;
  description: string;
  icon: LucideIcon;
  fields: readonly (keyof SignUpFormValues)[];
  optional?: boolean;
}

export interface ErrorItem {
  field: keyof SignUpFormValues | null;
  text: string;
}

export interface ErrorBanner {
  title: string;
  items: ErrorItem[];
}
