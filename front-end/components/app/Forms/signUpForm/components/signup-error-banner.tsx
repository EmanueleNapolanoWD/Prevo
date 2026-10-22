import type { ErrorBanner } from "@/types/Auth/signup.type";
import type { FieldName } from "@/lib/Utility/Auth/SignUp/sign-up.fields";

import styles from "../signup-form.module.css";

interface SignupErrorBannerProps {
  banner: ErrorBanner;
  onFieldClick: (field: FieldName) => void;
}

export function SignupErrorBanner({
  banner,
  onFieldClick,
}: SignupErrorBannerProps) {
  return (
    <div role="alert" className={styles.serverError}>
      <p className={styles.errorTitle}>{banner.title}</p>

      {banner.items.length > 0 && (
        <ul className={styles.errorList}>
          {banner.items.map((item, index) => (
            <li key={`${item.text}-${index}`}>
              {item.field ? (
                <button
                  type="button"
                  className={styles.errorLink}
                  onClick={() => onFieldClick(item.field!)}
                >
                  {item.text}
                </button>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}