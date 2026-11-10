/**
 * Contenuti della landing page Prevo.
 * Tutti i testi sono in italiano e vanno modificati qui, non nei componenti.
 */

export interface NavLink {
  key: string;
  label: string;
  href: string;
}

export interface ActionLink {
  label: string;
  href: string;
  variant: "ghost" | "primary";
}

export interface SiteNav {
  main: NavLink[];
  cta: ActionLink[];
}

export interface Stat {
  label: string;
  value: string;
  sub: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  intro: string;
  features: string[];
  cta: string;
  href: string;
  variant: "default" | "highlighted";
  badge?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Kpi {
  label: string;
  value: string;
  sub: string;
}

export interface ChartPoint {
  x: string;
  y: number;
}

export interface TableRow {
  numero: string;
  cliente: string;
  importo: string;
  stato: "accettato" | "in-attesa";
  data: string;
}

export interface LegendItem {
  label: string;
  value: string;
  color: "green" | "yellow" | "gray";
}

export interface SidebarItem {
  label: string;
  active?: boolean;
}

export interface HeroContent {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimary: ActionLink;
  ctaSecondary: ActionLink;
  microcopy: string;
  dashboardKicker: string;
  dashboardCaption: string;
}

export interface BenefitsContent {
  kicker: string;
  title: string;
  subtitle: string;
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface AiAssistantContent {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  checks: string[];
  linkLabel: string;
}

export interface ChatMessage {
  speaker: "user" | "assistant";
  text: string;
}

export interface DraftRow {
  label: string;
  value: string;
}

export interface AiChatContent {
  title: string;
  messages: ChatMessage[];
  draftTitle: string;
  draftClient: string;
  rows: DraftRow[];
  buttonLabel: string;
  footnote: string;
}

export interface HowItWorksContent {
  kicker: string;
  title: string;
  subtitle: string;
}

export interface PricingContent {
  kicker: string;
  title: string;
  subtitle: string;
  note: string;
}

export interface FaqContent {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  contactLinkLabel: string;
}

export interface FinalCtaContent {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaLabel: string;
}

export interface FooterContent {
  tagline: string;
  groups: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  legal: { label: string; href: string }[];
}

export interface LandingData {
  nav: SiteNav;
  hero: HeroContent;
  kpis: Kpi[];
  chartPoints: ChartPoint[];
  chartLabel: string;
  chartDropdown: string;
  legend: LegendItem[];
  tableRows: TableRow[];
  benefits: BenefitsContent;
  features: Feature[];
  steps: Step[];
  plans: Plan[];
  pricing: PricingContent;
  faqs: Faq[];
  faq: FaqContent;
  ai: AiAssistantContent;
  chat: AiChatContent;
  finalCta: FinalCtaContent;
  footer: FooterContent;
}

export const LANDING: LandingData = {
  nav: {
    main: [
      { key: "home", label: "Home", href: "/" },
      { key: "funzionalita", label: "Funzionalità", href: "#funzionalita" },
      { key: "come-funziona", label: "Come funziona", href: "#come-funziona" },
      { key: "prezzi", label: "Prezzi", href: "#prezzi" },
      { key: "risorse", label: "Risorse", href: "#faq" },
    ],
    cta: [
      { label: "Accedi", href: "/login", variant: "ghost" },
      { label: "Inizia gratis", href: "/sign-up", variant: "primary" },
    ],
  },

  hero: {
    kicker: "IL FUTURO DEI PREVENTIVI È QUI",
    titleLine1: "Creare preventivi.",
    titleLine2: "Non è mai stato così semplice.",
    subtitle:
      "Crea preventivi professionali, gestisci clienti e monitora la tua attività. Tutto in un'unica piattaforma.",
    ctaPrimary: { label: "Inizia gratis →", href: "/sign-up", variant: "primary" },
    ctaSecondary: { label: "Scopri le funzionalità", href: "#funzionalita", variant: "ghost" },
    microcopy: "Nessuna carta di credito richiesta. Nessuna complicazione.",
    dashboardKicker: "MENO BUROCRAZIA. PIÙ TEMPO PER IL TUO LAVORO.",
    dashboardCaption: "Una visione chiara, dal primo preventivo all'ultimo sì.",
  },

  kpis: [
    { label: "Preventivi creati", value: "24", sub: "Questo mese" },
    { label: "Valore preventivi", value: "€ 48.650", sub: "Totale del mese" },
    { label: "Preventivi accettati", value: "16", sub: "Su 24 inviati" },
    { label: "Tasso di conversione", value: "67%", sub: "Accettati / inviati" },
  ],

  chartLabel: "Andamento preventivi",
  chartDropdown: "Ultimi 6 mesi ⌄",
  chartPoints: [
    { x: "Mag", y: 12 },
    { x: "Giu", y: 22 },
    { x: "Lug", y: 18 },
    { x: "Ago", y: 30 },
    { x: "Set", y: 24 },
    { x: "Ott", y: 28 },
  ],

  legend: [
    { label: "Accettati", value: "16", color: "green" },
    { label: "In attesa", value: "6", color: "yellow" },
    { label: "In bozza", value: "2", color: "gray" },
  ],

  tableRows: [
    {
      numero: "PRV-024",
      cliente: "Rossi Impianti S.r.l.",
      importo: "€ 4.850,00",
      stato: "accettato",
      data: "24 ott 2026",
    },
    {
      numero: "PRV-023",
      cliente: "Bianchi Costruzioni",
      importo: "€ 8.200,00",
      stato: "in-attesa",
      data: "23 ott 2026",
    },
  ],

  benefits: {
    kicker: "IL TUO LAVORO, PIÙ SEMPLICE",
    title: "Meno fogli sparsi. Più tranquillità.",
    subtitle: "Dai cantieri all'ufficio, ogni informazione è al posto giusto.",
    items: [
      {
        icon: "Folder",
        title: "Tutto organizzato",
        description: "Basta cercare tra email, fogli Excel e appunti. Clienti, prodotti e preventivi vivono nello stesso spazio.",
      },
      {
        icon: "Zap",
        title: "Meno lavoro manuale",
        description: "Non ripartire ogni volta da zero. Riutilizza il tuo catalogo e lascia che l'AI ti aiuti con la prima bozza.",
      },
      {
        icon: "ShieldCheck",
        title: "Più controllo",
        description: "Sai sempre cosa è in bozza, cosa è stato inviato e cosa è stato accettato. Senza perdere il filo.",
      },
    ],
  },

  features: [
    {
      id: "preventivi",
      icon: "FileText",
      title: "Preventivi professionali",
      description: "Presenta il tuo lavoro al meglio con documenti chiari, curati e coerenti con la tua identità.",
      link: "Il tuo brand, in ogni proposta",
    },
    {
      id: "ai",
      icon: "Bot",
      title: "Assistente AI",
      description: "Descrivi il lavoro da realizzare. L'AI organizza le informazioni in una bozza da rivedere.",
      link: "Dall'idea alla prima bozza",
    },
    {
      id: "clienti",
      icon: "Users",
      title: "Gestione clienti",
      description: "Contatti, dati e storico dei preventivi: ritrova tutto ciò che ti serve, senza cercare altrove.",
      link: "Ogni relazione, al centro",
    },
    {
      id: "catalogo",
      icon: "Package",
      title: "Catalogo prodotti",
      description: "Organizza prodotti, servizi e lavorazioni. Richiama le voci del tuo catalogo nei preventivi.",
      link: "Non riscrivere le stesse cose",
    },
    {
      id: "dashboard",
      icon: "BarChart3",
      title: "Dashboard intelligente",
      description: "Tieni d'occhio andamento, importi e stato dei preventivi con una panoramica immediata.",
      link: "I numeri che contano, a colpo d'occhio",
    },
    {
      id: "team",
      icon: "Share2",
      title: "Collaborazione aziendale",
      description: "Condividi il lavoro con il tuo team e mantieni le informazioni allineate in azienda.",
      link: "La tua squadra, sulla stessa pagina",
    },
  ],
  steps: [
    { number: "01", title: "Inserisci cliente", description: "Seleziona un contatto o aggiungine uno nuovo." },
    { number: "02", title: "Aggiungi prodotti", description: "Scegli servizi e lavorazioni dal tuo catalogo." },
    { number: "03", title: "Genera la bozza", description: "Componi il preventivo, anche con l'aiuto dell'AI." },
    { number: "04", title: "Invia il preventivo", description: "Rivedi ogni dettaglio e condividi la tua proposta." },
  ],

  plans: [
    {
      id: "gratuito",
      name: "Gratuito",
      tagline: "Il primo passo verso un lavoro più semplice.",
      intro: "Parti dalle basi",
      features: ["Creazione preventivi", "Anagrafica clienti", "Catalogo prodotti", "Panoramica delle attività"],
      cta: "Inizia gratis →",
      href: "/sign-up",
      variant: "default",
    },
    {
      id: "professionale",
      name: "Professionale",
      tagline: "Per chi crea preventivi ogni giorno.",
      intro: "Fai spazio al tuo lavoro",
      features: ["Preventivi personalizzati", "Assistente AI", "Dashboard intelligente", "Gestione centralizzata"],
      cta: "Scopri Professionale →",
      href: "#funzionalita",
      variant: "highlighted",
      badge: "PER IL TUO LAVORO",
    },
    {
      id: "aziendale",
      name: "Aziendale",
      tagline: "Per le imprese che lavorano in squadra.",
      intro: "Cresci con il tuo team",
      features: ["Collaborazione aziendale", "Informazioni condivise", "Organizzazione del team", "Confronto sulle tue esigenze"],
      cta: "Parliamone ↗",
      href: "#faq",
      variant: "default",
    },
  ],

  pricing: {
    kicker: "UN PIANO PER OGNI FASE",
    title: "Piccola attività. Grandi progetti.",
    subtitle: "Scegli da dove partire. Prevo cresce insieme alla tua impresa.",
    note: "Vuoi capire quale piano fa per te? Confrontiamoci sulle esigenze della tua attività.",
  },

  faqs: [
    {
      id: "faq-1",
      question: "Che cosa posso fare con Prevo?",
      answer:
        "Puoi creare e gestire preventivi professionali, organizzare clienti e prodotti e seguire l'andamento della tua attività da un'unica piattaforma.",
    },
    {
      id: "faq-2",
      question: "Come funziona l'assistente AI?",
      answer:
        "Descrivi il lavoro da fare e Prevo prepara una bozza strutturata: importi, quantità e descrizioni. Rivedi, modifica e invia quando sei convinto.",
    },
    {
      id: "faq-3",
      question: "Posso personalizzare i miei preventivi?",
      answer:
        "Sì. Puoi aggiungere il tuo logo, scegliere i campi da mostrare e richiamare i prodotti del tuo catalogo in ogni preventivo.",
    },
    {
      id: "faq-4",
      question: "Posso usare Prevo con il mio team?",
      answer:
        "Sì. Il piano Aziendale è pensato per i team: informazioni condivise, preventivi visibili a tutti e lavoro organizzato in azienda.",
    },
    {
      id: "faq-5",
      question: "Prevo è adatto alla mia attività?",
      answer:
        "Prevo è studiato per piccole imprese, artigiani e studi professionali che vogliono smettere di usare fogli di calcolo e scrivere preventivi a mano.",
    },
  ],

  faq: {
    kicker: "FACCIAMO CHIAREZZA",
    titleLine1: "Le risposte,",
    titleLine2: "senza giri di parole.",
    description: "Tutto quello che vuoi sapere prima di iniziare con Prevo.",
    contactLinkLabel: "Hai altre domande? Scrivici ↗",
  },

  ai: {
    kicker: "L'AI CHE LAVORA CON TE",
    titleLine1: "Tu descrivi il lavoro.",
    titleLine2: "Prevo mette ordine.",
    description:
      "Da una semplice descrizione a una bozza strutturata. Meno tempo davanti allo schermo, più tempo per quello che sai fare meglio.",
    checks: [
      "Parti dalle tue parole, non da un foglio vuoto",
      "Rivedi e personalizza ogni dettaglio",
      "L'ultima parola resta sempre a te",
    ],
    linkLabel: "Scopri l'assistente AI →",
  },

  chat: {
    title: "✧ Assistente Prevo",
    messages: [
      {
        speaker: "user",
        text: "Prepara un preventivo per Rossi Impianti: 12 punti luce e installazione di un quadro elettrico.",
      },
      {
        speaker: "assistant",
        text: "Ecco la tua bozza. Controlla quantità e importi prima di inviarla al cliente.",
      },
    ],
    draftTitle: "BOZZA DI PREVENTIVO",
    draftClient: "Rossi Impianti",
    rows: [
      { label: "Punti luce", value: "12 unità" },
      { label: "Installazione quadro elettrico", value: "1 unità" },
    ],
    buttonLabel: "Rivedi la bozza →",
    footnote: "Esempio illustrativo",
  },

  finalCta: {
    kicker: "PIÙ SEMPLICE DA OGGI",
    titleLine1: "Il prossimo preventivo?",
    titleLine2: "Fallo con Prevo.",
    subtitle: "Meno tempo sulla burocrazia. Più spazio alla tua impresa.",
    ctaLabel: "Inizia gratis →",
  },

  footer: {
    tagline: "Il tuo lavoro merita più semplicità.",
    groups: [
      {
        title: "Prodotto",
        links: [
          { label: "Funzionalità", href: "#funzionalita" },
          { label: "Come funziona", href: "#come-funziona" },
          { label: "Prezzi", href: "#prezzi" },
        ],
      },
      {
        title: "Esplora",
        links: [
          { label: "Risorse", href: "#faq" },
          { label: "FAQ", href: "#faq" },
          { label: "Contatti", href: "#" },
        ],
      },
    ],
    legal: [
      { label: "Privacy policy", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "Termini di servizio", href: "#" },
    ],
  },
};

