"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

// actions
import { getProduct } from "@/lib/Api/Product/product.actions";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import { getQuoteSettingsAction } from "@/lib/Api/Quote/quote.action";
import {
  calcTotals,
  dateInDays,
  formatQuoteNumber,
  parseNumber,
} from "@/lib/utils";

// types
import type { Product } from "@/types/product";
import type { ClientDetail } from "@/types/client";
import type {
  QuoteSettingsData,
  QuoteItem,
  QuoteAppearanceValues,
} from "@/types/quote";

// ============================================================================
// Tipi
// ============================================================================

export interface QuoteContact {
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface QuoteHeaderValues {
  number: string;
  title: string;
  description: string;
}

export interface TaxQuoteValue {
  vat_rate: string;
  valid_until: string;
  surcharge: string;
  notes: string;
  terms: string;
}

type ContactId = string | number;
type QuoteTotals = ReturnType<typeof calcTotals>;
type ClientEmail = NonNullable<ClientDetail["emails"]>[number];
type ClientPhone = NonNullable<ClientDetail["phones"]>[number];
type ClientAddress = NonNullable<ClientDetail["addresses"]>[number];

type SearchResponse<T> = { ok: false; message: string } | { data: T[] };

// ============================================================================
// Costanti e helper
// ============================================================================

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

const PRODUCT_ERROR = "Errore durante il caricamento dei prodotti";
const CLIENT_ERROR = "Errore durante la ricerca dei clienti";
const SETTINGS_ERROR = "Errore durante il caricamento delle impostazioni";

const EMPTY_CONTACT: QuoteContact = { email: "", phone: "", address: "" };
const EMPTY_APPEARANCE: QuoteAppearanceValues = {
  template: "classic",
  primaryColor: "#1F2937",
  accentColor: "#2563EB",
};

// Preferisce il contatto primario, altrimenti il primo della lista
function pickDefault<T extends { id: ContactId; is_primary?: boolean }>(
  items: T[] | undefined | null,
): T | undefined {
  if (!items || items.length === 0) return undefined;
  return items.find((item) => item.is_primary) ?? items[0];
}

function formatAddress(address: ClientAddress | null): string {
  if (!address) return "";
  const cityLine = [address.postal_code, address.city]
    .filter(Boolean)
    .join(" ");
  return [address.street, cityLine].filter(Boolean).join(", ");
}

// ============================================================================
// Hook interno: ricerca con debounce (usato per prodotti e clienti)
// ============================================================================

function useDebouncedSearch<T>(
  // deve essere stabile (useCallback), altrimenti l'effetto riparte a ogni render
  fetcher: (query: string) => Promise<SearchResponse<T>>,
  errorMessage: string,
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const delay = q.length < MIN_CHARS ? 0 : DEBOUNCE_MS;

    const timer = setTimeout(async () => {
      if (q.length < MIN_CHARS) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetcher(q);
        if (cancelled) return;

        if ("ok" in res && res.ok === false) {
          setError(res.message);
          setResults([]);
        } else if ("data" in res) {
          setResults(res.data);
        }
      } catch {
        if (cancelled) return;
        setError(errorMessage);
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, fetcher, errorMessage]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, loading, error, reset };
}

// ============================================================================
// Interfacce di ritorno
// ============================================================================

export interface UseQuoteFormOptions {
  slug: string;
}

export interface UseQuoteFormReturn {
  // --- impostazioni azienda ---
  settings: QuoteSettingsData | null;
  settingsLoading: boolean;
  settingsError: string | null;
  currency: string;
  money: Intl.NumberFormat;

  // --- valori del form (default + modifiche dell'utente) ---
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  appearance: QuoteAppearanceValues;
  contact: QuoteContact;
  items: QuoteItem[];
  totals: QuoteTotals | null;

  // --- clienti ---
  clients: ClientDetail[];
  clientQuery: string;
  clientsLoading: boolean;
  clientError: string | null;
  selectedClient: ClientDetail | null;
  selectedEmail: ClientEmail | null;
  selectedPhone: ClientPhone | null;
  selectedAddress: ClientAddress | null;
  selectedEmailId: ContactId | null;
  selectedPhoneId: ContactId | null;
  selectedAddressId: ContactId | null;

  // --- prodotti ---
  products: Product[];
  productQuery: string;
  productsLoading: boolean;
  productError: string | null;
  selectedProduct: Product | null;

  // --- azioni ---
  setSelectedClient: (client: ClientDetail | null) => void;
  setClientQuery: (query: string) => void;
  setSelectedEmailId: (id: ContactId | null) => void;
  setSelectedPhoneId: (id: ContactId | null) => void;
  setSelectedAddressId: (id: ContactId | null) => void;
  setContact: (patch: Partial<QuoteContact>) => void;

  setQuoteNumber: (value: string) => void;
  setQuoteTitle: (value: string) => void;
  setQuoteDescription: (value: string | null) => void;
  setHeader: (values: QuoteHeaderValues) => void;
  setTax: (values: TaxQuoteValue) => void;
  setAppearance: (values: QuoteAppearanceValues) => void;

  setItems: (items: QuoteItem[]) => void;
  addItem: (item: Omit<QuoteItem, "id">) => void;
  removeItem: (id: string) => void;
  resetItems: () => void;

  setProductQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearSelection: () => void;

  resetForm: () => void;
  submit: () => Promise<{ ok: boolean; error?: string; data?: unknown }>;
}

// ============================================================================
// Hook
// ============================================================================

export function useQuoteForm({
  slug,
}: UseQuoteFormOptions): UseQuoteFormReturn {
  // --------------------------------------------------------------------------
  // Impostazioni preventivi
  // --------------------------------------------------------------------------
  const [settings, setSettings] = useState<QuoteSettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSettingsLoading(true);
      setSettingsError(null);

      try {
        const res = await getQuoteSettingsAction(slug);
        if (cancelled) return;

        if ("ok" in res && res.ok === false) {
          setSettingsError(res.message);
          setSettings(null);
        } else {
          setSettings(res as QuoteSettingsData);
        }
      } catch {
        if (!cancelled) setSettingsError(SETTINGS_ERROR);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currency = settings?.default_currency ?? "EUR";

  const money = useMemo(
    () => new Intl.NumberFormat("it-IT", { style: "currency", currency }),
    [currency],
  );

  // --------------------------------------------------------------------------
  // Valori del form = default derivati dalle impostazioni + modifiche utente.
  // Le modifiche sono Partial: ogni campo toccato vince, gli altri restano sui
  // default (anche se le impostazioni arrivano dopo che l'utente ha iniziato).
  // --------------------------------------------------------------------------
  const [headerEdits, setHeaderEdits] = useState<Partial<QuoteHeaderValues>>(
    {},
  );
  const [taxEdits, setTaxEdits] = useState<Partial<TaxQuoteValue>>({});
  const [appearanceEdits, setAppearanceEdits] = useState<
    Partial<QuoteAppearanceValues>
  >({});
  const [contactEdits, setContactEdits] = useState<Partial<QuoteContact>>({});

  const headerDefaults = useMemo<QuoteHeaderValues>(
    () => ({
      number: settings ? formatQuoteNumber(settings) : "",
      title: "",
      description: "",
    }),
    [settings],
  );

  const taxDefaults = useMemo<TaxQuoteValue>(
    () => ({
      vat_rate: settings ? String(Number(settings.default_vat_rate ?? 0)) : "",
      valid_until: settings
        ? dateInDays(settings.default_validity_days ?? 0)
        : "",
      surcharge: "0",
      notes: settings?.default_notes ?? "",
      terms: settings?.default_terms ?? "",
    }),
    [settings],
  );

  const header = useMemo(
    () => ({ ...headerDefaults, ...headerEdits }),
    [headerDefaults, headerEdits],
  );
  const tax = useMemo(
    () => ({ ...taxDefaults, ...taxEdits }),
    [taxDefaults, taxEdits],
  );
  const appearance = useMemo(
    () => ({ ...EMPTY_APPEARANCE, ...appearanceEdits }),
    [appearanceEdits],
  );

  const setHeader = useCallback(
    (values: QuoteHeaderValues) => setHeaderEdits(values),
    [],
  );
  const setTax = useCallback(
    (values: TaxQuoteValue) => setTaxEdits(values),
    [],
  );
  const setAppearance = useCallback(
    (values: QuoteAppearanceValues) => setAppearanceEdits(values),
    [],
  );

  const setQuoteNumber = useCallback(
    (number: string) => setHeaderEdits((prev) => ({ ...prev, number })),
    [],
  );
  const setQuoteTitle = useCallback(
    (title: string) => setHeaderEdits((prev) => ({ ...prev, title })),
    [],
  );
  const setQuoteDescription = useCallback(
    (description: string | null) =>
      setHeaderEdits((prev) => ({ ...prev, description: description ?? "" })),
    [],
  );

  // --------------------------------------------------------------------------
  // Voci del preventivo
  // --------------------------------------------------------------------------
  const [items, setItems] = useState<QuoteItem[]>([]);

  const addItem = useCallback((item: Omit<QuoteItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetItems = useCallback(() => setItems([]), []);

  const totals = useMemo<QuoteTotals | null>(() => {
    if (items.length === 0) return null;
    return calcTotals(
      items,
      parseNumber(tax.surcharge),
      parseNumber(tax.vat_rate),
    );
  }, [items, tax.surcharge, tax.vat_rate]);

  // --------------------------------------------------------------------------
  // Ricerca prodotti
  // --------------------------------------------------------------------------
  const fetchProducts = useCallback((q: string) => getProduct(slug, q), [slug]);

  const {
    query: productQuery,
    setQuery: setProductQuery,
    results: products,
    loading: productsLoading,
    error: productError,
    reset: resetProductSearch,
  } = useDebouncedSearch<Product>(fetchProducts, PRODUCT_ERROR);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedProduct(null);
    resetProductSearch();
  }, [resetProductSearch]);

  // --------------------------------------------------------------------------
  // Ricerca e selezione cliente
  // --------------------------------------------------------------------------
  const fetchClients = useCallback(
    (q: string) => getClients(slug, { q }),
    [slug],
  );

  const {
    query: clientQuery,
    setQuery: setClientQuery,
    results: clients,
    loading: clientsLoading,
    error: clientError,
    reset: resetClientSearch,
  } = useDebouncedSearch<ClientDetail>(fetchClients, CLIENT_ERROR);

  const [selectedClient, setSelectedClientState] =
    useState<ClientDetail | null>(null);
  const [emailId, setEmailId] = useState<ContactId | null>(null);
  const [phoneId, setPhoneId] = useState<ContactId | null>(null);
  const [addressId, setAddressId] = useState<ContactId | null>(null);

  // Se l'id scelto non esiste (o non è stato scelto) si usa il contatto primario
  const selectedEmail = useMemo(() => {
    const list = selectedClient?.emails;
    return list?.find((e) => e.id === emailId) ?? pickDefault(list) ?? null;
  }, [selectedClient, emailId]);

  const selectedPhone = useMemo(() => {
    const list = selectedClient?.phones;
    return list?.find((p) => p.id === phoneId) ?? pickDefault(list) ?? null;
  }, [selectedClient, phoneId]);

  const selectedAddress = useMemo(() => {
    const list = selectedClient?.addresses;
    return list?.find((a) => a.id === addressId) ?? pickDefault(list) ?? null;
  }, [selectedClient, addressId]);

  const setSelectedClient = useCallback(
    (client: ClientDetail | null) => {
      setSelectedClientState(client);
      setEmailId(null);
      setPhoneId(null);
      setAddressId(null);
      setContactEdits({});
      resetClientSearch();
    },
    [resetClientSearch],
  );

  // Cambiando il contatto scelto da elenco si scarta l'eventuale modifica manuale
  const setSelectedEmailId = useCallback((id: ContactId | null) => {
    setEmailId(id);
    setContactEdits((prev) => {
      const next = { ...prev };
      delete next.email;
      return next;
    });
  }, []);

  const setSelectedPhoneId = useCallback((id: ContactId | null) => {
    setPhoneId(id);
    setContactEdits((prev) => {
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  }, []);

  const setSelectedAddressId = useCallback((id: ContactId | null) => {
    setAddressId(id);
    setContactEdits((prev) => {
      const next = { ...prev };
      delete next.address;
      return next;
    });
  }, []);

  // Contatto effettivo = quello del cliente + eventuali modifiche manuali
  const contact = useMemo<QuoteContact>(
    () => ({
      ...EMPTY_CONTACT,
      email: selectedEmail?.email ?? "",
      phone: selectedPhone?.phone ?? "",
      address: formatAddress(selectedAddress),
      ...contactEdits,
    }),
    [selectedEmail, selectedPhone, selectedAddress, contactEdits],
  );

  const setContact = useCallback(
    (patch: Partial<QuoteContact>) =>
      setContactEdits((prev) => ({ ...prev, ...patch })),
    [],
  );

  // --------------------------------------------------------------------------
  // Reset e invio
  // --------------------------------------------------------------------------
  const resetForm = useCallback(() => {
    setSelectedClient(null);
    setHeaderEdits({});
    setTaxEdits({});
    setAppearanceEdits({});
    setItems([]);
    clearSelection();
  }, [setSelectedClient, clearSelection]);

  const submit = useCallback(async () => {
    if (!selectedClient) return { ok: false, error: "Seleziona un cliente" };
    if (items.length === 0)
      return { ok: false, error: "Aggiungi almeno una voce al preventivo" };

    const payload = {
      client_id: selectedClient.id,
      contact: {
        email: contact.email || null,
        phone: contact.phone || null,
        address: contact.address || null,
      },
      number: header.number,
      title: header.title,
      description: header.description || null,
      vat_rate: parseNumber(tax.vat_rate),
      surcharge: parseNumber(tax.surcharge),
      valid_until: tax.valid_until,
      notes: tax.notes || null,
      terms: tax.terms || null,
      appearance: {
        template: appearance.template,
        primary_color: appearance.primaryColor,
        accent_color: appearance.accentColor,
      },
      items: items.map(({ id, ...rest }) => ({
        product_id: rest.product_id ?? null,
        description: rest.description,
        quantity: parseNumber(String(rest.quantity)),
        unit_price: parseNumber(String(rest.unit_price)),
      })),
    };

    console.log("payload per quote: ", payload);

    //return createQuoteAction(slug, payload); // server action che chiama il backend
  }, [selectedClient, items, contact, header, tax, appearance, slug]);

  return {
    settings,
    settingsLoading,
    settingsError,
    currency,
    money,

    header,
    tax,
    appearance,
    contact,
    items,
    totals,

    clients,
    clientQuery,
    clientsLoading,
    clientError,
    selectedClient,
    selectedEmail,
    selectedPhone,
    selectedAddress,
    selectedEmailId: selectedEmail?.id ?? null,
    selectedPhoneId: selectedPhone?.id ?? null,
    selectedAddressId: selectedAddress?.id ?? null,

    products,
    productQuery,
    productsLoading,
    productError,
    selectedProduct,

    setSelectedClient,
    setClientQuery,
    setSelectedEmailId,
    setSelectedPhoneId,
    setSelectedAddressId,
    setContact,

    setQuoteNumber,
    setQuoteTitle,
    setQuoteDescription,
    setHeader,
    setTax,
    setAppearance,

    setItems,
    addItem,
    removeItem,
    resetItems,

    setProductQuery,
    setSelectedProduct,
    clearSelection,

    resetForm,
    submit,
  };
}
