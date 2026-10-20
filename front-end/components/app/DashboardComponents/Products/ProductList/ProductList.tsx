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

/** Costruisce l'URL della lista mantenendo i filtri attivi. */
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
}:ProductListProps) {
  const hasFilters = Boolean(filters.q || filters.status);

  return (
    <section className={styles.list} aria-labelledby="products-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Catalogo prodotti
          </p>
          <h1
            id="products-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Prodotti e servizi
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestisci ciò che puoi inserire nei tuoi documenti.
          </p>
        </div>
        <Button
          className="shrink-0"
          render={<Link href={`/${slug}/products/create`} />}
        >
          <PackagePlus data-icon="inline-start" />
          Nuovo prodotto
        </Button>
      </div>

      <div className={styles.toolbar}>
        <form role="search" method="get" action="" className={styles.search}>
          <label htmlFor="product-search" className="sr-only">
            Cerca prodotti
          </label>
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground"
            />
            <input
              id="product-search"
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Cerca per nome o codice"
              className="h-10 w-full rounded-md border bg-background px-3 pl-10 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            name="stato"
            defaultValue={filters.status ?? ""}
            aria-label="Stato"
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>

          <Button type="submit" variant="outline">
            Filtra
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              render={<Link href={`/${slug}/products`} />}
            >
              Azzera
            </Button>
          )}
        </form>

        <p className="text-sm text-muted-foreground">
          {meta.total} {meta.total === 1 ? "prodotto" : "prodotti"}
        </p>
      </div>

      <div className={styles.tableWrap}>
        {products.length > 0 ? (
          <table className={styles.table}>
            <caption className="sr-only">Elenco prodotti e servizi</caption>
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Categoria</th>
                <th>Unità</th>
                <th>Prezzo vendita</th>
                <th>Stato</th>
                <th>
                  <span className="sr-only">Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody>
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
                  <td className={styles.price}>
                    {formatPrice(product.sale_price)}
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${!product.is_active ? styles.statusInactive : ""}`}
                    >
                      {product.is_active ? "Attivo" : "Inattivo"}
                    </span>
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
            </tbody>
          </table>
        ) : (
          <div className={styles.empty}>
            {hasFilters
              ? "Nessun prodotto corrisponde ai filtri."
              : "Non hai ancora nessun prodotto. Aggiungi il primo."}
          </div>
        )}
      </div>

      {meta.last_page > 1 && (
        <nav
          aria-label="Paginazione"
          className="mt-4 flex items-center justify-between text-sm"
        >
          {page > 1 ? (
            <Button
              variant="outline"
              render={
                <Link href={buildProductsHref(slug, filters, page - 1)} />
              }
            >
              Precedente
            </Button>
          ) : (
            <span />
          )}

          <span>
            Pagina {page} di {meta.last_page}
          </span>

          {page < meta.last_page ? (
            <Button
              variant="outline"
              render={
                <Link href={buildProductsHref(slug, filters, page + 1)} />
              }
            >
              Successivo
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}
