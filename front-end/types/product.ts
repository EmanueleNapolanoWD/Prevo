import type { ApiError } from "@/lib/Api/Services/action.helpers";

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  category?: ProductCategoryRef | null;
  code: string | null;
  name: string;
  description: string | null;
  unit: string;
  sale_price: string; // Laravel restituisce i decimal come stringhe
  cost_price: string | null;
  vat_rate: string;
  margin: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}

export type ProductPayload = {
  category_id: string | null;
  code: string | null;
  name: string;
  description: string | null;
  unit: string;
  sale_price: number;
  cost_price: number | null;
  vat_rate: number;
  is_active: boolean;
};

export type ProductFilters = {
  q?: string;
  category_id?: string;
  active?: boolean;
  page?: number;
};

export type GetProductsResult = PaginatedProducts | ApiError;
export type GetProductResult = { data: Product } | ApiError;
export type ProductActionResult = ApiError; // create/update tornano solo in caso di errore (poi redirect)
export type DeleteProductResult = { ok: true } | ApiError;

export function isApiError<T extends object>(
  result: T | ApiError,
): result is ApiError {
  return "ok" in result && (result as ApiError).ok === false;
}
