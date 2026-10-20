"use server";

import {
  DeleteProductResult,
  GetProductResult,
  GetProductsResult,
  ProductActionResult,
  ProductFilters,
  ProductPayload,
} from "@/types/product";
import { authHeaders, serverApi } from "../Services/server-api";
import { toErrorResult } from "../Services/action.helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const base = (slug: string) => `/api/companies/${slug}/products`;

// lista prodotti
export async function getProducts(
  slug: string,
  filters: ProductFilters = {},
): Promise<GetProductsResult> {
  try {
    const res = await serverApi.get(base(slug), {
      headers: await authHeaders(),
      params: {
        q: filters.q || undefined,
        category_id: filters.category_id || undefined,
        active:
          filters.active === undefined ? undefined : Number(filters.active),
        page: filters.page || undefined,
      },
    });

    return res.data;
  } catch (error) {
    return toErrorResult(error, {
      401: "Devi effettuare l'accesso.",
      403: "Non hai i permessi per visualizzare i prodotti.",
      404: "Azienda non trovata.",
    });
  }
}

// dettaglio prodotto
export async function getProduct(
  slug: string,
  productId: string,
): Promise<GetProductResult> {
  try {
    const res = await serverApi.get(`${base(slug)}/${productId}`, {
      headers: await authHeaders(),
    });

    return res.data;
  } catch (error) {
    return toErrorResult(error, {
      401: "Devi effettuare l'accesso.",
      403: "Non hai i permessi per visualizzare questo prodotto.",
      404: "Prodotto non trovato.",
    });
  }
}

// creazione prodotto
export async function createProduct(
  slug: string,
  payload: ProductPayload,
): Promise<ProductActionResult> {
  try {
    await serverApi.post(base(slug), payload, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per creare un prodotto.",
      404: "Azienda non trovata.",
    });
  }

  revalidatePath(`${slug}/products`);
  redirect(`/${slug}/products`);
}

// update product
export async function updateProduct(
  slug: string,
  productId: string,
  payload: ProductPayload,
): Promise<ProductActionResult> {
  try {
    await serverApi.put(`${base(slug)}/${productId}`, payload, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per modificare questo prodotto.",
      404: "Prodotto non trovato.",
    });
  }

  revalidatePath(`/${slug}/products`);
  revalidatePath(`/${slug}/products/${productId}`);
  redirect(`/${slug}/products`);
}

// cancella product
export async function deleteProduct(
  slug: string,
  productId: string,
): Promise<DeleteProductResult> {
  try {
    await serverApi.delete(`${base(slug)}/${productId}`, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per eliminare questo prodotto.",
      404: "Prodotto non trovato o già eliminato.",
    });
  }

  revalidatePath(`/${slug}/products`);
  return { ok: true };
}
