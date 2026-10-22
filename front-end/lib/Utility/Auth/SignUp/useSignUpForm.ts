"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { registerUser, AuthError } from "@/lib/Api/Auth/auth";

// Schema e Tipi
import { registerSchema, type SignUpFormValues } from "@/lib/Validations/auth";
import type {
  FieldErrors,
  ErrorBanner,
  ErrorItem,
} from "@/types/Auth/signup.type";

// Costanti e Utility
import {
  FIELD_LABELS,
  initialValues,
  STEPS,
} from "@/lib/Utility/Auth/SignUp/sign-up.consts";
import { FIELD_CONFIG, FieldName } from "./sign-up.fields";
import { FieldError } from "@/components/ui/field";
import {
  toFieldKey,
  extractMessages,
  parseServerErrors,
} from "@/lib/Utility/Auth/SignUp/sign-up.utils";

export function useSignUpForm() {
  const router = useRouter();

  const [values, setValues] = useState<SignUpFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<ErrorBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const pendingFocus = useRef<keyof SignUpFormValues | null>(null);

  const current = STEPS[step];
  const StepIcon = current.icon;
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (!hasNavigated.current) return;
    const field = pendingFocus.current;
    pendingFocus.current = null;

    if (field) document.getElementById(field)?.focus();
    else headingRef.current?.focus();
  }, [step]);

  function goTo(index: number) {
    hasNavigated.current = true;
    setStep(index);
  }

  // aggiornamenti campi
  const updateField = useCallback((field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    setBanner((prev) => {
      if (!prev) return prev;

      const items = prev.items.filter((item) => item.field !== field);
      return items.length > 0 ? { ...prev, items } : null;
    });
  }, []);

  // Mostra gli errori e porta il focus sul primo campo errato.
  // STEPS è nell'ordine del form: il primo trovato è il primo che l'utente vede
  function applyFieldErrors(fieldErrors: FieldErrors) {
    setErrors(fieldErrors);

    const firstField = STEPS.flatMap((s) => s.fields).find(
      (field) => fieldErrors[field],
    );

    if (firstField) focusField(firstField);
  }

  // Porta l'utente al campo indicato, cambiando passo se serve
  function focusField(field: keyof SignUpFormValues) {
    const stepIndex = STEPS.findIndex((s) => s.fields.includes(field));
    if (stepIndex < 0) return;

    if (stepIndex === step) {
      document.getElementById(field)?.focus();
      return;
    }

    pendingFocus.current = field;
    goTo(stepIndex);
  }

  // Valida con lo schema completo, ma considera solo i campi del passo corrente.
  // NB: se lo schema usa .refine/.superRefine (es. password uguali), verifica
  // che scatti anche quando i passi successivi sono ancora vuoti.
  function validateStep(index: number): boolean {
    const result = registerSchema.safeParse(values);
    if (result.success) return true;

    const stepFields = new Set<FieldName>(STEPS[index].fields);
    const fieldErrors: FieldErrors = {};

    for (const issue of result.error.issues) {
      const field = toFieldKey(issue.path[0]);

      if (field && stepFields.has(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    const firstInvalid = STEPS[index].fields.find(
      (field) => fieldErrors[field],
    );
    if (!firstInvalid) return true;

    setErrors((prev) => ({ ...prev, ...fieldErrors }));
    document.getElementById(firstInvalid)?.focus();
    return false;
  }

  function handleNext() {
    setBanner(null);
    if (!validateStep(step)) return;
    goTo(step + 1);
  }

  function handleBack() {
    goTo(step - 1);
  }

  // Un solo punto per tutti gli errori che arrivano dal server
  function showServerError(error: unknown) {
    let status: number | undefined;
    let message: string | undefined;
    let rawErrors: unknown;

    if (error instanceof AuthError) {
      status = error.status;
      message: error.message;
      rawErrors: error.fieldErrors;
    } else if (axios.isAxiosError(error)) {
      status = error.response?.status;
      message: error.response?.message;
      rawErrors = error.response?.data?.errors;
    } else {
      setBanner({
        title:
          error instanceof Error
            ? error.message
            : "Impossibile completare la registrazione",
        items: [],
      });
      return;
    }

    if (status === 422) {
      const { fieldErrors, items } = parseServerErrors(rawErrors);

      applyFieldErrors(fieldErrors);
      setBanner({
        title:
          items.length > 0
            ? "La registrazione contiene degli errori: "
            : (message ?? "I dati npn sono validi"),
        items,
      });
      return;
    }

    setBanner({
      title: message ?? "registrazione non riuscita. Risporva più tardi!",
      items: extractMessages(rawErrors).map((text) => ({
        field: null,
        text,
      })),
    });
  }

  // HANDLE SUBMIT
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (!isLast) {
      handleNext();
      return;
    }

    setErrors({});
    setBanner(null);

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      const items: ErrorItem[] = [];

      for (const issue of result.error.issues) {
        const field = toFieldKey(issue.path[0]);

        if (field) {
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;

          items.push({
            field,
            text: `${FIELD_LABELS[field] ?? field}: ${issue.message}`,
          });
        } else {
          const path = issue.path.join(".");
          items.push({
            field: null,
            text: path ? `${path}: ${issue.message}` : issue.message,
          });
        }
      }

      applyFieldErrors(fieldErrors);
      setBanner({ title: "Controlla i dati inseriti:", items });
      return;
    }

    setLoading(true);

    try {
      await registerUser(result.data);
      router.replace("/dashboard");
      setValues(initialValues);
      router.refresh();
    } catch (error: unknown) {
      showServerError(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    values,
    errors,
    banner,
    loading,
    step,
    showPassword,
    setShowPassword,
    headingRef,
    current,
    StepIcon,
    isLast,
    goTo,
    handleNext,
    handleBack,
    handleSubmit,
    updateField,
    focusField,
  };
}
