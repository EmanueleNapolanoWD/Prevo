"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import axios from "axios";

import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError(
        "Non è stato possibile uscire. Controlla la connessione e riprova.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (err: unknown) {
        if (!active) return;

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.replace("/login");
          return;
        }

        setError(
          "Impossibile verificare la sessione. Controlla la connessione e riprova.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return <main className="p-8">Verifica della sessione...</main>;
  }

  if (error) {
    return (
      <main className="p-8">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="mt-4 underline"
          onClick={() => window.location.reload()}
        >
          Riprova
        </button>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard PREVO</h1>

      <p className="mt-4">
        Benvenuto, {user.name} {user.surname}!
      </p>

      <p className="text-muted-foreground">{user.email}</p>

      <div className="mt-6 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLoggingOut ? "Uscita in corso..." : "Esci"}
        </button>

        {logoutError && (
          <p className="text-sm text-destructive" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </main>
  );
}
