import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildListHref } from "@/lib/utils";
import styles from "../../../../../app/(app)/[slug]/clients/page.module.css";

export function ClientsPagination({
  slug,
  q,
  tipo,
  currentPage,
  lastPage,
}: {
  slug: string;
  q?: string;
  tipo?: string;
  currentPage: number;
  lastPage: number;
}) {
  return (
    <nav className={styles.pagination} aria-label="Paginazione contatti">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        render={
          <Link href={buildListHref(slug, { q, tipo }, currentPage - 1)} />
        }
      >
        <ArrowLeft data-icon="inline-start" />
        Precedente
      </Button>
      <span>
        Pagina <strong>{currentPage}</strong> di {lastPage}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= lastPage}
        render={
          <Link href={buildListHref(slug, { q, tipo }, currentPage + 1)} />
        }
      >
        Successivo
        <ArrowRight data-icon="inline-end" />
      </Button>
    </nav>
  );
}
