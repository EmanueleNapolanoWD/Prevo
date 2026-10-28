"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ============================================================================
// IMPORT: actions
// ============================================================================
import { getProduct } from "@/lib/Api/Product/product.actions";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import {
  createQuoteAction,
  updateQuoteAction,
  getQuoteSettingsAction,
} from "@/lib/Api/Quote/quote.action";
import {
  calcTotals,
  dateInDays,
  formatQuoteNumber,
  parseNumber,
  centsToEuros,
  eurosToCents,
} from "@/lib/utils";

// ============================================================================
// IMPORT: tipi
// ============================================================================
import type { Product } from "@/types/product";
import type { ClientDetail } from "@/types/client";
import {
  type QuoteSettingsData,
  type QuoteItem,
  type QuoteAppearanceValues,
  type QuotePayload,
  type QuoteDetail,
  type Quote,
  type DiscountType,
  DISCOUNT_TYPE_TO_API,
  API_TO_DISCOUNT_TYPE,
  toQuotePayloadAppearance,
  toQuotePayloadItem,
  toQuoteItem,
  toQuoteAppearanceValues,
  QuoteCompany,
} from "@/types/quote";

// ============================================================================
// TIPI PUBBLICI
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
  discount_type: DiscountType;
  discount_value: string;
  notes: string;
  terms: string;
}

export type SubmitResult =
  | { ok: true; data: Quote }
  | { ok: false; error: string };

// ============================================================================
// TIPI INTERNI
// ============================================================================

type ContactId = string | number;
type QuoteTotals = ReturnType<typeof calcTotals>;
type ClientEmail = NonNullable<ClientDetail["emails"]>[number];
type ClientPhone = NonNullable<ClientDetail["phones"]>[number];
type ClientAddress = NonNullable<ClientDetail["addresses"]>[number];

type SearchResponse<T> = { ok: false; message: string } | { data: T[] };

type PersistedQuote = { id: QuoteDetail["id"]; version: number | undefined };

// ============================================================================
// COSTANTI
// ============================================================================

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

const PRODUCT_ERROR = "Errore durante il caricamento dei prodotti";
const CLIENT_ERROR = "Errore durante la ricerca dei clienti";
const SETTINGS_ERROR = "Errore durante il caricamento delle impostazioni";
const SUBMIT_ERROR = "Errore durante il salvataggio";
const SUBMIT_BUSY = "Salvataggio già in corso";

const EMPTY_CONTACT: QuoteContact = { email: "", phone: "", address: "" };
const EMPTY_APPEARANCE: QuoteAppearanceValues = {
  template: "classic",
  primaryColor: "#1F2937",
  accentColor: "#2563EB",
};

// ============================================================================
// HELPER: unità monetarie
// Form e anteprima (calcTotals) lavorano in EURO; l'API parla in CENTESIMI.
// Lo sconto percentuale non è un importo e resta una percentuale.
// ============================================================================

function discountToApi(type: DiscountType, value: number): number {
  return type === "percentage" ? value : eurosToCents(value);
}

function discountFromApi(type: DiscountType, value: unknown): number {
  return type === "percentage"
    ? Number(value ?? 0)
    : centsToEuros(value as number);
}

// ============================================================================
// HELPER: contatti cliente
// ============================================================================

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
// HELPER: mapper preventivo (backend) -> valori del form (solo modifica)
// Tutti i campi vanno valorizzati, anche se vuoti: i valori del preventivo
// vincono sui default delle impostazioni azienda (note, termini, IVA, validità).
// ============================================================================

function quoteToHeader(q: QuoteDetail): QuoteHeaderValues {
  return {
    number: q.number ?? "",
    title: q.title ?? "",
    description: q.description ?? "",
  };
}

function quoteToTax(q: QuoteDetail): TaxQuoteValue {
  const discountType: DiscountType = q.discount_type
    ? API_TO_DISCOUNT_TYPE[q.discount_type]
    : "percentage";

  return {
    vat_rate: String(Number(q.vat_rate ?? 0)),
    valid_until: q.valid_until?.slice(0, 10) ?? "", // input date: YYYY-MM-DD
    surcharge: String(centsToEuros(q.surcharge)),
    discount_type: discountType,
    discount_value: String(discountFromApi(discountType, q.discount_value)),
    notes: q.notes ?? "",
    terms: q.terms ?? "",
  };
}

function quoteToContact(q: QuoteDetail): QuoteContact {
  return {
    email: q.contact?.email ?? "",
    phone: q.contact?.phone ?? "",
    address: q.contact?.address ?? "",
  };
}

// ============================================================================
// HOOK INTERNO: ricerca con debounce (prodotti e clienti)
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
// INTERFACCE: opzioni e valore di ritorno
// ============================================================================

export interface UseQuoteFormOptions {
  slug: string;
  /** Presente = modalità modifica. */
  quote?: QuoteDetail;
  /**
   * Cliente completo (con emails, phones, addresses) per la modifica.
   * quote.client è solo uno snapshot: il cliente va caricato a parte
   * nella page di edit.
   */
  initialClient?: ClientDetail | null;
}

export interface UseQuoteFormReturn {
  // --- modalità ---
  isEdit: boolean;

  // --- azienda ---
  company: QuoteCompany | null;

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
  submit: () => Promise<SubmitResult>;
}

// ============================================================================
// HOOK PRINCIPALE
// ============================================================================

export function useQuoteForm({
  slug,
  quote,
  initialClient = null,
}: UseQuoteFormOptions): UseQuoteFormReturn {
  const isEdit = !!quote;

  // --------------------------------------------------------------------------
  // VALORI INIZIALI (da preventivo in modifica, vuoti in creazione)
  // Usati sia per l'inizializzazione degli stati sia per resetForm.
  // --------------------------------------------------------------------------
  const initial = useMemo(
    () => ({
      header: quote ? quoteToHeader(quote) : ({} as Partial<QuoteHeaderValues>),
      tax: quote ? quoteToTax(quote) : ({} as Partial<TaxQuoteValue>),
      appearance: quote
        ? toQuoteAppearanceValues(quote.appearance)
        : ({} as Partial<QuoteAppearanceValues>),
      contact: quote ? quoteToContact(quote) : ({} as Partial<QuoteContact>),
      items: quote ? quote.items.map(toQuoteItem) : ([] as QuoteItem[]),
      client: initialClient,
    }),
    [quote, initialClient],
  );

  // Chiave della 'sorgente' del form: quando cambia avvia nuova versione dopo un refresh
  const sourceKey = `${quote?.id ?? "new"}:${quote?.version ?? 0}:${initialClient?.id ?? "none"}`;

  // Preventivo già salvato (id + versione) per il controllo di concorrenza.
  // Si aggiorna dopo OGNI salvataggio, create incluso: un secondo invio aggiorna
  // lo stesso preventivo invece di duplicarlo e non dà un falso 409.
  const persistedRef = useRef<PersistedQuote | null>(
    quote ? { id: quote.id, version: quote.version } : null,
  );

  const submittingRef = useRef(false);

  // Se arriva un preventivo diverso o una versione più recente dal server, si
  // allinea; una versione più vecchia (refresh in ritardo) non fa tornare indietro.
  useEffect(() => {
    if (!quote) return;

    const current = persistedRef.current;
    if (!current || current.id !== quote.id) {
      persistedRef.current = { id: quote.id, version: quote.version };
    } else if ((quote.version ?? 0) > (current.version ?? 0)) {
      persistedRef.current = { id: quote.id, version: quote.version };
    }
  }, [quote]);

  // --------------------------------------------------------------------------
  // IMPOSTAZIONI PREVENTIVI
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
        if (!cancelled) setSettings(res);
      } catch {
        if (!cancelled) {
          setSettings(null);
          setSettingsError(SETTINGS_ERROR);
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currency = settings?.default_currency ?? quote?.currency ?? "EUR";

  const money = useMemo(
    () => new Intl.NumberFormat("it-IT", { style: "currency", currency }),
    [currency],
  );

  // --------------------------------------------------------------------------
  // VALORI DEL FORM = default dalle impostazioni + modifiche utente
  // Le modifiche sono Partial: ogni campo toccato vince, gli altri restano sui
  // default. In modifica le edits partono dal preventivo, quindi i default
  // delle impostazioni non sovrascrivono nulla.
  // --------------------------------------------------------------------------
  const [headerEdits, setHeaderEdits] = useState<Partial<QuoteHeaderValues>>(
    () => initial.header,
  );
  const [taxEdits, setTaxEdits] = useState<Partial<TaxQuoteValue>>(
    () => initial.tax,
  );
  const [appearanceEdits, setAppearanceEdits] = useState<
    Partial<QuoteAppearanceValues>
  >(() => initial.appearance);

  const [contactEdits, setContactEdits] = useState<Partial<QuoteContact>>(
    () => initial.contact,
  );

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
      discount_type: "percentage",
      discount_value: "0",
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
  // VOCI DEL PREVENTIVO
  // --------------------------------------------------------------------------
  const [items, setItems] = useState<QuoteItem[]>(() => initial.items);

  const addItem = useCallback((item: Omit<QuoteItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetItems = useCallback(() => setItems(initial.items), [initial]);

  // Anteprima in euro: i centesimi possono differire di qualche unità dal
  // backend (che riconcilia per aliquota). Dopo il salvataggio fa fede res.data.
  const totals = useMemo<QuoteTotals | null>(() => {
    if (items.length === 0) return null;
    return calcTotals(
      items,
      parseNumber(tax.surcharge),
      parseNumber(tax.vat_rate),
      { type: tax.discount_type, value: parseNumber(tax.discount_value) },
    );
  }, [
    items,
    tax.surcharge,
    tax.vat_rate,
    tax.discount_type,
    tax.discount_value,
  ]);

  // --------------------------------------------------------------------------
  // RICERCA E SELEZIONE PRODOTTI
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
  // RICERCA E SELEZIONE CLIENTE
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
    useState<ClientDetail | null>(() => initial.client);
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

  // Cambiando cliente si azzerano contatti scelti e modifiche manuali
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

  // --------------------------------------------------------------------------
  // CONTATTO EFFETTIVO = quello del cliente + modifiche manuali
  // In modifica, contactEdits contiene il contatto salvato nel preventivo.
  // --------------------------------------------------------------------------
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
  // RIALLINEAMENTO ALLA SORGENTE (reset + cambio di quote/initialClient)
  // In creazione svuota il form, in modifica ripristina i valori del preventivo.
  // L'ordine conta: i contactEdits iniziali vanno impostati DOPO l'azzeramento.
  // --------------------------------------------------------------------------
  const applyInitial = useCallback(() => {
    setSelectedClientState(initial.client);
    setEmailId(null);
    (setPhoneId(null), setAddressId(null), resetClientSearch());

    setHeaderEdits(initial.header);
    setTaxEdits(initial.tax);
    (setAppearanceEdits(initial.appearance),
      setContactEdits(initial.contact),
      setItems(initial.items));
    clearSelection();
  }, [initial, resetClientSearch, clearSelection]);

  const resetForm = applyInitial;

  // Se quote o initialClient cambiano dopo il mount (page di edit che carica il
  // cliente in ritardo, refresh dopo un salvataggio, altro preventivo) gli
  // useState non si rieseguono da soli: si riallinea durante il render, senza
  // frame intermedio con lo stato vecchio.
  const [syncedKey, setSyncedKey] = useState(sourceKey);
  if (syncedKey !== sourceKey) {
    setSyncedKey(sourceKey);
    applyInitial();
  }

  // --------------------------------------------------------------------------
  // INVIO (creazione o aggiornamento)
  // --------------------------------------------------------------------------
  const submit = useCallback(async (): Promise<SubmitResult> => {
    if (submittingRef.current) return { ok: false, error: SUBMIT_BUSY };

    // ---- validazione ----
    // In modifica, se il cliente completo non è stato caricato, vale quello salvato
    const clientId = selectedClient?.id ?? quote?.client_id ?? null;

    if (!clientId) return { ok: false, error: "Seleziona un cliente" };

    if (items.length === 0) {
      return { ok: false, error: "Aggiungi almeno una voce al preventivo" };
    }

    if (!header.title.trim()) {
      return { ok: false, error: "Inserisci titolo preventivo" };
    }

    const discountValue = parseNumber(tax.discount_value || "0");
    if (Number.isNaN(discountValue) || discountValue < 0) {
      return { ok: false, error: "Sconto del preventivo non valido" };
    }
    if (tax.discount_type === "percentage" && discountValue > 100) {
      return { ok: false, error: "Lo sconto percentuale non può superare 100" };
    }

    const vatRate = parseNumber(tax.vat_rate);
    if (Number.isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
      return { ok: false, error: "Aliquota IVA non valida" };
    }

    const surcharge = parseNumber(tax.surcharge || "0");
    if (Number.isNaN(surcharge) || surcharge < 0) {
      return { ok: false, error: "Maggiorazione non valida" };
    }

    // ---- payload (importi in centesimi) ----
    // items: toQuotePayloadItem deve convertire unit_price e lo sconto Fixed di
    // riga in centesimi (vedi note).
    const payload: QuotePayload = {
      client_id: clientId,
      contact: {
        email: contact.email || null,
        phone: contact.phone || null,
        address: contact.address || null,
      },
      title: header.title.trim(),
      description: header.description.trim() || null,
      vat_rate: vatRate,
      surcharge: eurosToCents(surcharge),
      // Senza sconto non si invia nulla: il backend azzera tipo e valore
      ...(discountValue > 0
        ? {
            discount_type: DISCOUNT_TYPE_TO_API[tax.discount_type],
            discount_value: discountToApi(tax.discount_type, discountValue),
          }
        : {}),
      valid_until: tax.valid_until || null,
      notes: tax.notes.trim() || null,
      terms: tax.terms.trim() || null,
      appearance: toQuotePayloadAppearance(appearance),
      items: items.map(toQuotePayloadItem),
    };

    // ---- invio ----
    submittingRef.current = true;
    try {
      const persisted = persistedRef.current;

      const res = persisted
        ? await updateQuoteAction(slug, persisted.id, {
            ...payload,
            version: persisted.version, // controllo di concorrenza lato backend
          })
        : await createQuoteAction(slug, payload);

      if (!res.ok) return { ok: false, error: res.message };

      persistedRef.current = { id: res.data.id, version: res.data.version };

      return { ok: true, data: res.data };
    } catch {
      // errori fuori dal contratto delle action (rete, ecc.)
      return { ok: false, error: SUBMIT_ERROR };
    } finally {
      submittingRef.current = false;
    }
  }, [selectedClient, items, contact, header, tax, appearance, slug, quote]);

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------
  return {
    isEdit,

    company: settings?.company ?? null,

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
