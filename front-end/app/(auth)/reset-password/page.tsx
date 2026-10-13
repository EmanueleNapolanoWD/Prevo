import ResetPasswordForm from "@/components/app/Forms/resetPasswordForm/ResetPasswordForm";
import Link from "next/link";

export default function ResetPasswordPage(){
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
        <ResetPasswordForm />
      </div>
    </main>
    )
}