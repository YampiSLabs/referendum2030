export interface MockResultOption {
  option_id: number;
  label: string;
  votes: number;
}

export interface MockResults {
  referendum: string;
  slug: string;
  total_votes: number;
  tokens_issued: number;
  last_updated: string;
  options: MockResultOption[];
}

export const MOCK_RESULTS: MockResults = {
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
