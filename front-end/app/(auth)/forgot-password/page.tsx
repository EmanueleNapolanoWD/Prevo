import Link from "next/link";
import ForgotPasswordForm from "@/components/app/Forms/forgotPasswordForm/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
      <Link
        href="/"
        aria-label="Prevo home"
        className="text-2xl font-bold tracking-tight text-foreground"
      >
        prevo<span className="text-primary">.</span>
      </Link>

      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>

      <Link
        href="/login"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Torna al login
      </Link>
    </main>
  );
}