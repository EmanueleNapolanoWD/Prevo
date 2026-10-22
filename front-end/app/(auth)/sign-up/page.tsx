import { SignupForm } from "@/components/app/Forms/signUpForm/signup-form";
import SignupBrandPanel from "@/components/app/DashboardComponents/Auth/SignUp/SignupBrandPanel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 grid grid-cols-2">
      <div className="hidden lg:block lg:grid-col-1">
        <SignupBrandPanel />
      </div>
      <div className="grid-col-1 md:grid-col-1 lg:grid-col-1 h-full">
        <SignupForm />
      </div>
    </main>
  );
}
