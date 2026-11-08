"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Mail,
  Phone,
  Save,
  User,
  AlertCircle,
  Lock,
} from "lucide-react";

interface PersonalData {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfilePage() {
  const [personal, setPersonal] = useState<PersonalData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });
  const [password, setPassword] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handlePersonalChange = useCallback(
    (field: keyof PersonalData, value: string) => {
      setPersonal((prev) => ({ ...prev, [field]: value }));
      setStatus(null);
    },
    [],
  );

  const handlePasswordChange = useCallback(
    (field: keyof PasswordData, value: string) => {
      setPassword((prev) => ({ ...prev, [field]: value }));
      setStatus(null);
    },
    [],
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setStatus(null);
    }
  };

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsSaving(false);
    setStatus({
      type: "success",
      message: "Profilo aggiornato con successo.",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-6 py-8 border-b border-border">
        <Link
          href="./.."
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Impostazioni</span>
          <span>›</span>
          <span>Profilo utente</span>
        </Link>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gestione account
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profilo utente
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Modifica le tue informazioni personali e le impostazioni di sicurezza
            del tuo account.
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Dati personali */}
            <Card className="border border-border rounded-xl bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dati personali
                </CardTitle>
                <CardDescription>
                  Aggiorna il tuo nome, cognome, email e recapito telefonico.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nome</Label>
                    <Input
                      id="profile-name"
                      value={personal.name}
                      onChange={(e) =>
                        handlePersonalChange("name", e.target.value)
                      }
                      placeholder="Mario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-surname">Cognome</Label>
                    <Input
                      id="profile-surname"
                      value={personal.surname}
                      onChange={(e) =>
                        handlePersonalChange("surname", e.target.value)
                      }
                      placeholder="Rossi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="profile-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="profile-email"
                    type="email"
                    value={personal.email}
                    onChange={(e) =>
                      handlePersonalChange("email", e.target.value)
                    }
                    placeholder="mario.rossi@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="profile-phone" className="text-sm font-medium">
                      Telefono
                    </Label>
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={personal.phone}
                    onChange={(e) =>
                      handlePersonalChange("phone", e.target.value)
                    }
                    placeholder="+39 333 000 0000"
                  />
                </div>
                <Separator orientation="horizontal" className="my-2" />
                <div className="space-y-2">
                  <Label htmlFor="profile-avatar">Immagine del profilo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} />
                        ) : (
                          <AvatarFallback>
                            {personal.name.charAt(0)}{personal.surname.charAt(0)}
                          </AvatarFallback>
                        )}
                        <input
                          id="profile-avatar"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAvatarChange}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-0 right-0"
                          onClick={() =>
                            document.getElementById("profile-avatar")?.click()
                          }
                          aria-label="Cambia immagine profilo"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                      </Avatar>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Formati supportati: JPG, PNG. Dimensione massima: 2 MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Card: Sicurezza / Password */}
            <Card className="border border-border rounded-xl bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Sicurezza e password
                </CardTitle>
                <CardDescription>
                  Modifica la password di accesso al tuo account Prevo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-current">Password attuale</Label>
                  <Input
                    id="password-current"
                    type="password"
                    value={password.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-new">Nuova password</Label>
                  <Input
                    id="password-new"
                    type="password"
                    value={password.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-confirm">Conferma nuova password</Label>
                  <Input
                    id="password-confirm"
                    type="password"
                    value={password.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
            </Card>

            {status && (
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  status.type === "success"
                    ? "bg-green-50/50 border-green-200 text-green-700"
                    : "bg-red-50/50 border-red-200 text-red-700"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}
          </div>
          {/* Colonna laterale: riepilogo e azione */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {personal.name || personal.surname
                        ? `${personal.name} ${personal.surname}`
                        : "Nome utente"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {personal.email || "email@example.com"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="icon" className="text-muted-foreground">
                  <User className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  L&apos;email è il tuo identificativo di accesso. Modificala con
                  attenzione.
                </p>
                <p className="text-xs text-muted-foreground">
                  La modifica della password richiederà il nuovo accesso su tutti
                  i dispositivi.
                </p>
              </div>
            </div>

            {/* Bottone salvataggio */}
            <Card className="border border-border rounded-xl bg-card shadow-sm p-6">
              <CardFooter className="flex justify-end gap-3 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPersonal({
                      name: "",
                      surname: "",
                      email: "",
                      phone: "",
                    });
                    setPassword({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setAvatarUrl(null);
                    setStatus(null);
                  }}
                  disabled={isSaving}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 animate-spin" />
                      Salvataggio…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva modifiche
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <form id="profile-form" onSubmit={handleSave} style={{ display: "none" }} />
    </div>
  );
}