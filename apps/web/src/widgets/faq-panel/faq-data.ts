export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES = [
  { id: "projecte", name: "Sobre el projecte", count: 2 },
  { id: "votacio", name: "Sobre la votació", count: 3 },
  { id: "privacitat", name: "Privacitat", count: 2 },
  { id: "resultats", name: "Resultats", count: 2 }
];

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
