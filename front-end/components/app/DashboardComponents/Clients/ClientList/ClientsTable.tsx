import Link from "next/link";
import { Mail, MapPin, Phone ,Pencil} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/types/client";
import styles from "../../../../../app/(app)/[slug]/clients/page.module.css";
import { DeleteClientButton } from "./DeleteClientButton";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
function value<T extends { is_primary?: boolean; is_default?: boolean }>(
  items: T[] | undefined,
  key: keyof T,
  primary: "is_primary" | "is_default",
) {
  const item = items?.find((entry) => entry[primary]) ?? items?.[0];
  return item?.[key] as string | undefined;
}

export function ClientsTable({
  clients,
  slug,
}: {
  clients: Client[];
  slug: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipologia</TableHead>
            <TableHead>Contatti</TableHead>
            <TableHead>Città</TableHead>
            <TableHead className={styles.actionsHead}>
              <span className="sr-only">Azioni</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const email = value(client.emails, "email", "is_primary");
            const phone = value(client.phones, "phone", "is_primary");
            const city = value(client.addresses, "city", "is_default");
            return (
              <TableRow key={client.id}>
                <TableCell>
                  <div className={styles.identity}>
                    <Avatar>
                      <AvatarFallback>
                        {initials(client.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={styles.identityText}>
                      <Link
                        className={styles.clientName}
                        href={`/${slug}/clients/contacts/${client.id}`}
                      >
                        {client.display_name}
                      </Link>
                      <span>ID {client.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {client.type ? (
                    <Badge variant="secondary">
                      {client.type === "COMPANY" ? "Azienda" : "Persona"}
                    </Badge>
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className={styles.contactStack}>
                    {email && (
                      <span>
                        <Mail />
                        {email}
                      </span>
                    )}
                    {phone && (
                      <span>
                        <Phone />
                        {phone}
                      </span>
                    )}
                    {!email && !phone && (
                      <span className={styles.muted}>—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={styles.city}>
                    <MapPin />
                    {city ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className={styles.actions}>
                    {/* Modifica */}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Modifica ${client.display_name}`}
                      title="Modifica"
                      render={
                        <Link
                          href={`/${slug}/clients/contacts/${client.id}/update`}
                        />
                      }
                    >
                      <Pencil />
                    </Button>

                    {/* Elimina */}
                    <DeleteClientButton
                      slug={slug}
                      clientId={client.id}
                      clientName={client.display_name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
