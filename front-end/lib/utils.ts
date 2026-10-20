import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UTILS PER CLIENTS
export function buildListHref(slug: string, filters: { q?: string; tipo?: string }, page?: number) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.tipo) params.set("tipo", filters.tipo)
  if (page && page > 1) params.set("page", String(page))
  const query = params.toString()
  return `/${slug}/clients${query ? `?${query}` : ""}`
}
