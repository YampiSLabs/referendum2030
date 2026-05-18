export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
  };
}

export const SEO_DEFAULTS = {
  defaultTitle: "Referèndum 2030 — Simulador de Votació Digital",
  defaultDescription: "Exercici de portfoli de disseny de simulador de votació digital accessible, transparent i sense validesa legal.",
  siteName: "Referèndum 2030",
  twitterCard: "summary_large_image",
} as const;
