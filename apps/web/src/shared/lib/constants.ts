import type { Referendum, Results, AuditEvent } from "./types";

export const MOCK_REFERENDUM: Referendum = {
  title: "Referèndum 2030",
  slug: "referendum-2030",
  description: "Simulador cívic digital d'un referèndum fictici sobre el futur polític de Catalunya.",
  is_current: true,
  starts_at: "2030-05-12T09:00:00Z",
  ends_at: "2030-05-18T20:00:00Z",
  total_voters_census: 630000,
  question: {
    id: 1,
    text: "Vols que Catalunya iniciï un procés constituent digital l'any 2030?",
    options: [
      { id: 1, label: "Sí", order: 1 },
      { id: 2, label: "No", order: 2 },
      { id: 3, label: "En blanc", order: 3 }
    ]
  }
};

export const MOCK_RESULTS: Results = {
  referendum: "Referèndum 2030",
  slug: "referendum-2030",
  total_votes: 245730,
  tokens_issued: 245730,
  last_updated: "2030-05-18T20:05:00Z",
  options: [
    { option_id: 1, label: "Sí", votes: 128012 },
    { option_id: 2, label: "No", votes: 95132 },
    { option_id: 3, label: "En blanc", votes: 22586 }
  ]
};

export const MOCK_DEMARCATION_RESULTS = [
  { name: "Barcelona", si: 55, no: 36, blanc: 9 },
  { name: "Girona", si: 51, no: 40, blanc: 9 },
  { name: "Lleida", si: 48, no: 41, blanc: 11 },
  { name: "Tarragona", si: 54, no: 37, blanc: 9 }
];

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt_1",
    event_type: "referendum_created",
    public_message: "S'ha creat el referèndum i configurat les opcions oficials.",
    created_at: "2030-05-12T08:15:21Z",
    verified: true
  },
  {
    id: "evt_2",
    event_type: "token_issued",
    public_message: "S'ha emès un token anònim de votació.",
    created_at: "2030-05-12T09:02:11Z",
    verified: true
  },
  {
    id: "evt_3",
    event_type: "vote_cast",
    public_message: "S'ha registrat un vot de manera completament segura.",
    created_at: "2030-05-12T18:43:07Z",
    verified: true
  },
  {
    id: "evt_4",
    event_type: "results_viewed",
    public_message: "S'han consultat els resultats públics agregats.",
    created_at: "2030-05-18T20:00:15Z",
    verified: true
  }
];

export const FAQ_CATEGORIES = [
  { id: "projecte", name: "Sobre el projecte", count: 2 },
  { id: "votacio", name: "Sobre la votació", count: 3 },
  { id: "privacitat", name: "Privacitat", count: 2 },
  { id: "resultats", name: "Resultats", count: 2 }
];

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "projecte",
    question: "Aquest projecte és oficial?",
    answer: "No. Referèndum 2030 és una simulació fictícia per a fins acadèmics i de portfoli, sense validesa legal ni cap vinculació amb la Generalitat de Catalunya, el Govern d'Espanya ni cap altra institució pública o partit polític."
  },
  {
    category: "projecte",
    question: "Qui impulsa aquest simulador?",
    answer: "Aquesta plataforma és un exercici tècnic de demostració per explorar interfícies institucionals, estats interactius de React sota Astro i dissenys altament accessibles. Tot el codi font és públic."
  },
  {
    category: "votacio",
    question: "Com obtinc un token?",
    answer: "Pots generar un token de proves directament des del formulari de votació fent clic a 'Generar token demo' o introduint-ne un de manual. Aquest token s'emet de forma totalment anònima i serveix per a un únic vot de simulació."
  },
  {
    category: "votacio",
    question: "Puc votar més d'una vegada?",
    answer: "No amb el mateix token. Cada token té un sol ús i queda invalidat de manera irreversible un cop s'ha emès el vot, garantint així que no hi hagi duplicats en la simulació."
  },
  {
    category: "votacio",
    question: "El meu vot és secret?",
    answer: "Sí, absolutament. En cap moment es demana cap dada personal ni s'emmagatzema informació del dispositiu, de la IP o la teva identitat. El token es desa hashejat i no hi ha cap relació tècnica entre el token utilitzat i l'opció triada."
  },
  {
    category: "privacitat",
    question: "Quines dades es guarden?",
    answer: "Únicament es desen el registre de vots agregats per cada opció ('Sí', 'No', 'En blanc') i la llista de tokens utilitzats en format de hash no-reversible per evitar que es voti dos cops amb el mateix token."
  },
  {
    category: "privacitat",
    question: "Com es protegeix la meva privacitat?",
    answer: "Mitjançant disseny de zero-knowledge. Com que no es demana DNI, correu, nom ni cognoms, no hi ha cap base de dades personals per protegir ni cap perill de filtració d'identitat."
  },
  {
    category: "resultats",
    question: "Quan es publiquen els resultats?",
    answer: "En aquesta demostració, els resultats estan oberts en temps real. En una simulació de referèndum tancat, s'actualitzen automàticament en finalitzar el termini de votació."
  },
  {
    category: "resultats",
    question: "Puc verificar el recompte?",
    answer: "Sí. Un cop emès el vot, el sistema et proporciona un codi de rebut únic (`receipt_code`). Pots descarregar el conjunt de dades anònim i comprovar que el rebut del teu vot es troba comptabilitzat correctament en el total."
  }
];
