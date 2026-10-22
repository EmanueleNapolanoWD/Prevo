import { Check } from "lucide-react";

import { STEPS } from "@/lib/Utility/Auth/SignUp/sign-up.consts";

import styles from "../signup-form.module.css";

interface SignupStepperProps {
  step: number;
  loading: boolean;
  onSelect: (index: number) => void;
}

export function SignupStepper({ step, loading, onSelect }: SignupStepperProps) {
  return (
    <ol className={styles.stepper} aria-label="Avanzamento registrazione">
      {STEPS.map((s, index) => {
        const Icon = s.icon;
        const state =
          index < step ? "done" : index === step ? "current" : "todo";

        return (
          <li key={s.id} className={styles.step} data-state={state}>
            <button
              type="button"
              className={styles.stepButton}
              disabled={index > step || loading}
              aria-current={index === step ? "step" : undefined}
              aria-label={`Passo ${index + 1}: ${s.title}`}
              onClick={() => onSelect(index)}
            >
              <span className={styles.stepCircle}>
                {state === "done" ? <Check aria-hidden /> : <Icon aria-hidden />}
              </span>
              <span className={styles.stepLabel}>{s.title}</span>
            </button>

            {index < STEPS.length - 1 && (
              <span className={styles.connector} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}