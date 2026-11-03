import {
  PackagePlus,
  Pencil,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./product-list.module.css";
import { Product, PaginationMeta } from "@/types/product";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductionButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProductStatus } from "@/components/app/shared/quote-status";
import { ListToolbar } from "@/components/app/shared/ListToolbar";
import { DataCard } from "@/components/app/shared/DataCard";
import { TablePagination } from "@/components/app/shared/TablePagination";
import { PageHeader } from "@/components/app/shared/PageHeader";
import { StatusBadge } from "@/components/app/shared/StatusBadge";

type Filters = { q?: string; status?: string };

interface ProductListProps {
  slug: string;
  products: Product[];
  meta: PaginationMeta;
  filters: Filters;
  page: number;
}

const UNIT_LABELS: Record<string, string> = {
  pz: "Pezzo",
  m: "Metro",
  m2: "m²",
  m3: "m³",
  kg: "Kg",
  l: "Litro",
  h: "Ora",
  gg: "Giorno",
  forfait: "A corpo",
};

const formatPrice = (value: string | number | null) =>
  value === null
    ? "—"
    : Number(value).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });

export function buildProductsHref(
  slug: string,
  filters: Filters,
  page?: number,
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/${slug}/products${query ? `?${query}` : ""}`;
}

export default function ProductList({
  slug,
  products,
  meta,
  filters,
  page,
}: ProductListProps) {
  const hasFilters = Boolean(filters.q || filters.status);
  const statusOptions = [
    { value: "", label: "Stato" },
    { value: "active", label: "Attivi" },
    { value: "inactive", label: "Inattivi" },
  ];
  return (
    <section className={styles.list} aria-labelledby="products-heading">
      <PageHeader
        title="Catalogo"
        description="Gestisci i prodotti e servizi che puoi inserire nei tuoi documenti."
        actions={
          <Link
            href={`/${slug}/products/create`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            <PackagePlus data-icon="inline-start" className="size-4" />
            Nuovo prodotto
          </Link>
        }
      />
      <DataCard>
        <ListToolbar
          placeholder="Cerca per nome o codice…"
          q={filters.q ?? ""}
          onQueryChange={() => {}}
          filterLabel="Stato"
          filterValue={filters.status ?? ""}
          filterOptions={statusOptions}
          onFilterChange={() => {}}
        />
        {hasFilters && (
          <div className="flex items-start gap-2 pt-3">
            <Button variant="outline" size="sm" className="text-xs">
              Azzera filtri
            </Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Prodotto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Unità</TableHead>
                <TableHead className="text-right">Prezzo vendita</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-24">
                  <span className="sr-only">Azioni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productName}>
                      <span>{product.name}</span>
                      {product.code && (
                        <span className={styles.productCode}>
                          {product.code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{product.category?.name ?? "—"}</td>
                  <td className={styles.secondary}>
                    {UNIT_LABELS[product.unit] ?? product.unit}
                  </td>
                  <td className={`${styles.price} text-right`}>
                    {formatPrice(product.sale_price)}
                  </td>
                  <td>
                    <StatusBadge
                      status={product.is_active ? "active" : "inactive"}
                      dot
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Modifica ${product.name}`}
                        title="Modifica"
                        render={
                          <Link
                            href={`/${slug}/products/${product.id}/update`}
                          />
                        }
                      >
                        <Pencil data-icon="inline-start" />
                      </Button>
                      <DeleteProductButton
                        slug={slug}
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {hasFilters
                      ? "Nessun prodotto corrisponde ai filtri."
                      : "Non hai ancora nessun prodotto. Aggiungi il primo."}
                  </TableCell>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={page}
          lastPage={meta.last_page}
          totalItems={meta.total ?? products.length}
          pageItems={products.length}
          buildHref={(p) => buildProductsHref(slug, filters, p)}
        />
      </DataCard>
    </section>
  );
}
