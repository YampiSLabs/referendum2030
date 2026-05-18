export interface MockOption {
  id: number;
  label: string;
  order: number;
}

export interface MockQuestion {
  id: number;
  text: string;
  options: MockOption[];
}

export interface MockReferendum {
  title: string;
  slug: string;
  description: string;
  status: "open" | "closed";
  starts_at: string;
  ends_at: string;
  total_voters_census: number;
  question: MockQuestion;
}

export const MOCK_REFERENDUM: MockReferendum = {
  title: "Referèndum 2030",
  slug: "referendum-2030",
  description: "Simulador cívic digital d'un referèndum fictici sobre el futur polític de Catalunya.",
  status: "open",
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
