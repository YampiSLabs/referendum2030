// Localized Catalan number formatter (ex: 245.730)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ca-ES").format(num);
}

// Compact number formatting for chart labels (ex: 245.7K)
export function formatCompact(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(".", ",")}K`;
  }
  return num.toString();
}

// Localized Catalan date-time formatter (ex: 17 de maig de 2026, 17:01)
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ca-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
