import Link from "next/link";
import { Plus, PackagePlus, Search, SlidersHorizontal, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/Api/Product/product.actions";
import { isApiError } from "@/types/product";
import { DeleteProductButton } from "@/components/app/DashboardComponents/Products/ProductList/DeleteProductionButton";
import styles from "@/components/app/shared/list-page.module.css";

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tutti i prodotti" },
  { value: "active", label: "Attivi" },
  { value: "inactive", label: "Inattivi" },
];

function formatPrice(value: string | number | null) {
  if (value === null) return "—";
  return Number(value).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

function truncate(str: string | null | undefined, len = 38) {
  if (!str) return "—";
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const currentPage = Math.max(1, Number(filters.page) || 1);
  const active = filters.status === "active" ? true : filters.status === "inactive" ? false : undefined;
  const res = await getProducts(slug, { q: filters.q, active, page: currentPage });

  if (isApiError(res)) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState} role="alert">
          <strong>Impossibile caricare i prodotti</strong>
          <span>{res.message}</span>
        </div>
      </main>
    );
  }

  const products = res.data ?? [];
  const lastPage = res.meta?.last_page ?? 1;
  const hasFilters = Boolean(filters.q || filters.status);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}>CATALOGO PRODOTTI</div>
          <h1 className={styles.pageTitle}>Prodotti</h1>
          <p className={styles.pageDescription}>Gestisci il catalogo prodotti e servizi inseribili nei tuoi documenti.</p>
        </div>
        <Button size="lg" className={styles.newButton} render={<Link href={`/${slug}/products/create`} />}>
          <PackagePlus data-icon="inline-start" /> Nuovo prodotto
        </Button>
      </header>

      <div className={styles.toolbar}>
        <form className={styles.filters} method="get">
          <div className={styles.searchField}>
            <Search aria-hidden="true" />
            <Input name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Cerca per nome o codice" aria-label="Cerca prodotti" />
          </div>
          <Select name="stato" defaultValue={filters.status ?? "all"}>
            <SelectTrigger className={styles.typeSelect} aria-label="Stato prodotto">
              <SlidersHorizontal aria-hidden="true" /><SelectValue placeholder="Tutti i prodotti" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Filtra</Button>
          {hasFilters && (
            <Button variant="ghost" render={<Link href={`/${slug}/products`} />}>Azzera filtri</Button>
          )}
        </form>
        <Button variant="outline" render={<Link href={`/${slug}/products/import`} />}>
          <Upload data-icon="inline-start" /> Importa / Esporta
        </Button>
      </div>

      <section className={styles.tableCard} aria-label="Elenco prodotti">
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Tutti i prodotti</h2>
            <p className={styles.sectionMeta}>{products.length} risultati in questa pagina</p>
          </div>
          <span className={styles.liveDot}><span /> Sincronizzato</span>
        </div>
        {products.length ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Prodotto / Servizio</th>
                  <th className="text-left">Descrizione</th>
                  <th className="text-left">Categoria</th>
                  <th className="text-center">Unità</th>
                  <th className="text-right">Prezzo Acquisto</th>
                  <th className="text-right font-semibold">Prezzo Vendita</th>
                  <th className="text-left">Stato</th>
                  <th className={styles.actionsHead}>
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="text-left">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        {product.code && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {product.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-left">
                      <span className="text-muted-foreground truncate" title={product.description ?? ""}>
                        {truncate(product.description)}
                      </span>
                    </td>
                    <td className="text-left">
                      {product.category ? (
                        <Badge variant="secondary" size="sm">
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center text-xs">{product.unit ?? "—"}</td>
                    <td className="text-right">
                      {product.cost_price ? formatPrice(product.cost_price) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-right font-medium">
                      {formatPrice(product.sale_price)}
                    </td>
                    <td className="text-left">
                      <Badge variant={product.is_active ? "default" : "secondary"} size="sm">
                        {product.is_active ? "Attivo" : "Inattivo"}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Modifica ${product.name}`}
                          title="Modifica"
                          render={
                            <Link href={`/${slug}/products/${product.id}/update`} />
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
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h2>{hasFilters ? "Nessun prodotto trovato" : "Nessun prodotto"}</h2>
            <p>
              {hasFilters
                ? "Prova a modificare o azzerare i filtri."
                : "Aggiungi il tuo primo prodotto."}
            </p>
            <div>
              {hasFilters ? (
                <Button variant="outline" render={<Link href={`/${slug}/products`} />}>
                  Azzera filtri
                </Button>
              ) : (
                <Button render={<Link href={`/${slug}/products/create`} />}>
                  <Plus data-icon="inline-start" /> Nuovo prodotto
                </Button>
              )}
            </div>
          </div>
        )}
        {lastPage > 1 && (
          <nav className={styles.pagination} aria-label="Paginazione prodotti">
            {currentPage > 1 ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/${slug}/products?q=${filters.q ?? ""}&stato=${filters.status ?? "all"}&page=${
                      currentPage - 1
                    }`}
                  />
                }
              >
                Precedente
              </Button>
            ) : (
              <span />
            )}
            <span>
              Pagina <strong>{currentPage}</strong> di {lastPage}
            </span>
            {currentPage < lastPage ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/${slug}/products?q=${filters.q ?? ""}&stato=${filters.status ?? "all"}&page=${
                      currentPage + 1
                    }`}
                  />
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
    </main>
  );
}
