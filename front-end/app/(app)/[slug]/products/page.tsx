import ProductList, {
  buildProductsHref,
} from "@/components/app/DashboardComponents/Products/ProductList/ProductList";
import { getProducts } from "@/lib/Api/Product/product.actions";
import { isApiError } from "@/types/product";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import styles from "./page.module.css";

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

async function ProductContent({
  params,
  searchParams,
}: ProductsPageProps) {
  const { slug } = await params;
  const { q, status, page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const active =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const res = await getProducts(slug, { q, active, page: currentPage });

  if (isApiError(res)) {
    return (
      <p role="alert" className={styles.error}>
        {res.message}
      </p>
    );
  }

  // Dopo l'eliminazione dell'ultimo elemento di una pagina, torna all'ultima pagina valida
  if (currentPage > 1 && res.data.length === 0) {
    redirect(
      buildProductsHref(slug, { q, status }, Math.max(1, res.meta.last_page)),
    );
  }

  return (
    <ProductList
      slug={slug}
      products={res.data}
      meta={res.meta}
      filters={{ q, status }}
      page={currentPage}
    />
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <main className={styles.page}>
      <Suspense
        fallback={
          <p className={styles.loading}>
            Caricamento prodotti…
          </p>
        }
      >
        <ProductContent {...props} />
      </Suspense>
    </main>
  );
}
