import type { Locale } from "../i18n/translations";

export const LOCALIZED_ROUTES = {
  ca: {
    home: "/",
    votar: "/votar",
    resultats: "/resultats",
    transparencia: "/transparencia",
    faq: "/faq",
  },
  es: {
    home: "/es/",
    votar: "/es/votar",
    resultats: "/es/resultados",
    transparencia: "/es/transparencia",
    faq: "/es/faq",
  },
  en: {
    home: "/en/",
    votar: "/en/vote",
    resultats: "/en/results",
    transparencia: "/en/transparency",
    faq: "/en/faq",
  },
  fr: {
    home: "/fr/",
    votar: "/fr/voter",
    resultats: "/fr/resultats",
    transparencia: "/fr/transparence",
    faq: "/fr/faq",
  },
  ar: {
    home: "/ar/",
    votar: "/ar/vote",
    resultats: "/ar/results",
    transparencia: "/ar/transparency",
    faq: "/ar/faq",
  },
  zh: {
    home: "/zh/",
    votar: "/zh/vote",
    resultats: "/zh/results",
    transparencia: "/zh/transparency",
    faq: "/zh/faq",
  },
} as const;

export type RouteKey = keyof typeof LOCALIZED_ROUTES["ca"];

export const ROUTES = LOCALIZED_ROUTES.ca; // Backwards compatibility with standard Catalan routes

export function getRoute(key: RouteKey, lang: Locale): string {
  return LOCALIZED_ROUTES[lang]?.[key] || LOCALIZED_ROUTES["ca"][key];
}

export function getLanguageName(lang: Locale): string {
  const names = {
    ca: "Català",
    es: "Español",
    en: "English",
    fr: "Français",
    ar: "العربية",
    zh: "简体中文"
  };
  return names[lang] || lang;
}

export function getPageKeyFromPath(pathname: string): RouteKey {
  // Strip trailing slash for consistency
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  
  if (cleanPath === "/" || cleanPath === "/ca") return "home";
  
  // Match locale subpaths (e.g. /es/votar -> /votar, /es -> /)
  const matches = cleanPath.match(/^\/(es|en|fr|ar|zh)(\/.*)?$/);
  const pathWithoutLocale = matches ? (matches[2] || "/") : cleanPath;
  const cleanPathWithoutLocale = pathWithoutLocale.replace(/\/$/, "") || "/";

  if (cleanPathWithoutLocale === "/") return "home";

  if (cleanPathWithoutLocale.endsWith("/votar") || cleanPathWithoutLocale.endsWith("/vote") || cleanPathWithoutLocale.endsWith("/voter")) {
    return "votar";
  }
  if (cleanPathWithoutLocale.endsWith("/resultats") || cleanPathWithoutLocale.endsWith("/resultados") || cleanPathWithoutLocale.endsWith("/results")) {
    return "resultats";
  }
  if (cleanPathWithoutLocale.endsWith("/transparencia") || cleanPathWithoutLocale.endsWith("/transparence") || cleanPathWithoutLocale.endsWith("/transparency")) {
    return "transparencia";
  }
  if (cleanPathWithoutLocale.endsWith("/faq")) {
    return "faq";
  }

  return "home";
}
