"use client";

import { AuthUser } from "@/types/auth";
import { Bell, Menu } from "lucide-react";

interface PageHeaderProps {
  user: AuthUser | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Buongiorno";
  }

  if (hour >= 12 && hour < 18) {
    return "Buon pomeriggio";
  }

  return "Buonasera";
}

export default function PageHeader({ user }: PageHeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-5 lg:px-8">
      <div className="flex items-start gap-3">
        <button
          aria-label="Apri menu"
          className="mt-0.5 rounded-lg p-2 hover:bg-muted lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {user?.name} {user?.surname}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Ecco come sta andando il tuo lavoro.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Notifiche"
          className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  );
}