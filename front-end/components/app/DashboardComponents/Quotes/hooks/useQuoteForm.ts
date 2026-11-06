"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ============================================================================
// IMPORT: actions e utility
// ============================================================================
import { getProduct } from "@/lib/Api/Product/product.actions";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import {
  createQuoteAction,
  updateQuoteAction,
} from "@/lib/Api/Quote/quote.action";
import { calcTotals, parseNumber } from "@/lib/utils";

// ============================================================================
// IMPORT: tipi esterni
// ============================================================================
import type { Product } from "@/types/product";
import type { ClientDetail } from "@/types/client";
import type {
  QuoteItem,
  QuoteAppearanceValues,
} from "@/lib/Utility/Quote/quote.types";

// ============================================================================
// IMPORT: file locali
// ============================================================================
import {
  CLIENT_ERROR,
  DEFAULT_CURRENCY,
  EMPTY_APPEARANCE,
  EMPTY_CONTACT,
  MONEY_LOCALE,
  PRODUCT_ERROR,
  SUBMIT_BUSY,
  SUBMIT_ERROR,
} from "@/lib/Utility/Quote/quote.consts";
import {
  buildInitialValues,
  buildQuotePayload,
  formatAddress,
  getHeaderDefaults,
  getAppearanceDefaults,
  getSourceKey,
  getTaxDefaults,
  pickDefault,
  withoutContactField,
} from "@/lib/Utility/Quote/quote.helpers";
import { validateQuoteForm } from "@/lib/Utility/Quote/quote.validation";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useQuoteSettings } from "../../Settings/QuoteSettings/hooks/useQuoteSettings";
import type {
  ContactId,
  PersistedQuote,
  QuoteContact,
  QuoteHeaderValues,
  QuoteTotals,
  SubmitResult,
  TaxQuoteValue,
  UseQuoteFormOptions,
  UseQuoteFormReturn,
} from "@/lib/Utility/Quote/quote.types";

// Re-export: chi importava i tipi da "useQuoteForm" continua a funzionare
export type {
  QuoteContact,
  QuoteHeaderValues,
  TaxQuoteValue,
  SubmitResult,
  UseQuoteFormOptions,
  UseQuoteFormReturn,
} from "@/lib/Utility/Quote/quote.types";

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
    () => buildInitialValues(quote, initialClient),
    [quote, initialClient],
  );

  const sourceKey = getSourceKey(quote, initialClient);

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
  const { settings, settingsLoading, settingsError } = useQuoteSettings(slug);

  const currency =
    settings?.default_currency ?? quote?.currency ?? DEFAULT_CURRENCY;

  const money = useMemo(
    () => new Intl.NumberFormat(MONEY_LOCALE, { style: "currency", currency }),
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

  const headerDefaults = useMemo(() => getHeaderDefaults(settings), [settings]);
  const taxDefaults = useMemo(() => getTaxDefaults(settings), [settings]);
  const appearanceDefaults = useMemo(
    () => getAppearanceDefaults(settings),
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
    () => ({ ...appearanceDefaults, ...appearanceEdits }),
    [appearanceDefaults, appearanceEdits],
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
    setContactEdits((prev) => withoutContactField(prev, "email"));
  }, []);

  const setSelectedPhoneId = useCallback((id: ContactId | null) => {
    setPhoneId(id);
    setContactEdits((prev) => withoutContactField(prev, "phone"));
  }, []);

  const setSelectedAddressId = useCallback((id: ContactId | null) => {
    setAddressId(id);
    setContactEdits((prev) => withoutContactField(prev, "address"));
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
    setPhoneId(null);
    setAddressId(null);
    resetClientSearch();

    setHeaderEdits(initial.header);
    setTaxEdits(initial.tax);
    setAppearanceEdits(initial.appearance);
    setContactEdits(initial.contact);
    setItems(initial.items);
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
    const validation = validateQuoteForm({
      clientId: selectedClient?.id ?? quote?.client_id ?? null,
      items,
      header,
      tax,
    });
    if (!validation.ok) return validation;

    // ---- payload (importi in centesimi) ----
    const payload = buildQuotePayload({
      values: validation.values,
      contact,
      header,
      tax,
      appearance,
      items,
    });

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
