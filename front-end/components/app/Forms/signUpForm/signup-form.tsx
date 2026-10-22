"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { STEPS } from "@/lib/Utility/Auth/SignUp/sign-up.consts";
import { useSignUpForm } from "@/lib/Utility/Auth/SignUp/useSignUpForm";

import { SignupField } from "./components/signup-fields";
import { SignupStepper } from "./components/signup-stepper";
import { SignupErrorBanner } from "./components/signup-error-banner";
import styles from "./signup-form.module.css";

export function SignupForm() {
  const {
    values,
    errors,
    banner,
    loading,
    step,
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
  } = useSignUpForm();

  return (
    <main className={styles.main}>
      <div className={styles.formArea}>
        <SignupStepper step={step} loading={loading} onSelect={goTo} />

        <form onSubmit={handleSubmit} noValidate className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>
              <StepIcon aria-hidden />
            </span>

            <div>
              <p className={styles.eyebrow}>
                Passo {step + 1} di {STEPS.length}
                {current.optional && (
                  <span className={styles.badge}>Facoltativo</span>
                )}
              </p>
              <h2 ref={headingRef} tabIndex={-1} className={styles.panelTitle}>
                {current.heading}
              </h2>
              <p className={styles.panelDescription}>{current.description}</p>
            </div>
          </div>

          {banner && (
            <SignupErrorBanner banner={banner} onFieldClick={focusField} />
          )}

          <FieldGroup key={current.id} className={styles.grid}>
            {current.fields.map((name) => (
              <SignupField
                key={name}
                name={name}
                value={values[name]}
                error={errors[name]}
                disabled={loading}
                onChange={updateField}
              />
            ))}
          </FieldGroup>

          <div className={styles.actions}>
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft aria-hidden />
                Indietro
              </Button>
            ) : (
              <span />
            )}

            {isLast ? (
              <Button
                key="submit"
                type="submit"
                disabled={loading}
                className={styles.primaryAction}
              >
                {loading ? (
                  <>
                    <Loader2 className={styles.spinner} aria-hidden />
                    Creazione account...
                  </>
                ) : (
                  <>
                    Crea account
                    <Check aria-hidden />
                  </>
                )}
              </Button>
            ) : (
              <Button
                key="next"
                type="button"
                onClick={handleNext}
                disabled={loading}
              >
                Continua
                <ArrowRight aria-hidden />
              </Button>
            )}
          </div>

          <p className={styles.requiredNote}>
            I campi contrassegnati con * sono obbligatori.
          </p>
        </form>

        <p className={styles.loginText}>
          Hai già un account?{" "}
          <Link href="/login" className={styles.loginLink}>
            Accedi
          </Link>
        </p>
      </div>
    </main>
  );
}
