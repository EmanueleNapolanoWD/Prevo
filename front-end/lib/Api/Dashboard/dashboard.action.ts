"use client";

import type { KpisResult, KpiValue, TodoItem, ChartPoint, InsightsResult } from "./dashboard.server";

export async function getDashboardKpis(slug: string, range: "7d" | "30d" | "90d" = "30d"): Promise<KpisResult> {
  const res = await fetch(`/api/dashboard/kpis?slug=${slug}&range=${range}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Errore" }));
    throw new Error(err.message ?? "Errore di rete");
  }

  return (await res.json()) as any;
}

export async function getDashboardTodos(slug: string): Promise<TodoItem[]> {
  const res = await fetch(`/api/dashboard/todos?slug=${slug}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Errore caricamento TODO");
  }

  return (await res.json()) as any;
}

export async function getDashboardRecent(slug: string, limit: number = 8): Promise<{
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
  validUntil: string | null;
}[]> {
  const res = await fetch(`/api/dashboard/recent?slug=${slug}&limit=${limit}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Errore caricamento recenti");
  }

  return (await res.json()) as any;
}

export async function getDashboardChart(slug: string, range: "7d" | "30d" | "90d" = "30d"): Promise<ChartPoint[]> {
  const res = await fetch(`/api/dashboard/chart?slug=${slug}&range=${range}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Errore caricamento grafico");
  }

  return (await res.json()) as any;
}

export async function getDashboardInsights(slug: string): Promise<InsightsResult> {
  const res = await fetch(`/api/dashboard/insights?slug=${slug}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Errore caricamento insights");
  }

  return (await res.json()) as any;
}