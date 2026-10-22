import { SignUpFormValues } from "@/lib/Validations/auth";
import { LucideIcon } from "lucide-react";

export type FieldErrors = Partial<Record<keyof SignUpFormValues, string>>;
export type SelectOption = { value: string; label: string };
export type StepId = "account" | "company" | "fiscal" | "rea" | "address";

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
