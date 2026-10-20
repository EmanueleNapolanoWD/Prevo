import Link from "next/link";
import { Search, SlidersHorizontal, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "../../../../../app/(app)/[slug]/clients/page.module.css";

export function ClientsToolbar({
  slug,
  q,
  tipo,
  hasFilters,
}: {
  slug: string;
  q?: string;
  tipo?: string;
  hasFilters: boolean;
}) {
  return (
    <div className={styles.toolbar}>
      <form className={styles.filters} method="get">
        <div className={styles.searchField}>
          <Search aria-hidden="true" />
          <Input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Cerca per nome, e-mail o telefono"
            aria-label="Cerca contatti"
          />
        </div>
        <Select name="tipo" defaultValue={tipo ?? "all"}>
          <SelectTrigger
            className={styles.typeSelect}
            aria-label="Tipo contatto"
          >
            <SlidersHorizontal aria-hidden="true" />
            <SelectValue placeholder="Tutti i tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="PERSON">Persone</SelectItem>
            <SelectItem value="COMPANY">Aziende</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Filtra</Button>
        {hasFilters && (
          <Button variant="ghost" render={<Link href={`/${slug}/clients`} />}>
            Azzera filtri
          </Button>
        )}
      </form>
      <Button
        variant="outline"
        render={<Link href={`/${slug}/clients/import`} />}
      >
        <Upload data-icon="inline-start" />
        Importa / Esporta
      </Button>
    </div>
  );
}
