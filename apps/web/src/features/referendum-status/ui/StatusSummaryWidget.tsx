import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Loader2, UsersRound } from "lucide-react";
import { getCurrentReferendum } from "../../../entities/referendum/api/getReferendum";
import { getResults } from "../../../features/results/api/getResults";
import { useTranslations } from "../../../shared/i18n/translations";
import type { Locale } from "../../../shared/i18n/translations";

const queryClient = new QueryClient();

const localeMap: Record<Locale, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-EG",
  zh: "zh-CN",
};

interface StatusSummaryWidgetProps {
  lang?: Locale;
}

function formatNumber(value: number, lang: Locale) {
  return new Intl.NumberFormat(localeMap[lang] || "ca-ES").format(value);
}

function formatDateTime(isoDate: string | null | undefined, lang: Locale) {
  if (!isoDate) {
    return { date: "--", time: "--" };
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return { date: "--", time: "--" };
  }

  const locale = localeMap[lang] || "ca-ES";
  return {
    date: new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

function StatusSummaryPanel({ lang = "ca" }: { lang: Locale }) {
  const t = useTranslations(lang);
  const referendumQuery = useQuery({
    queryKey: ["current-referendum"],
    queryFn: getCurrentReferendum,
  });

  const slug = referendumQuery.data?.slug;
  const resultsQuery = useQuery({
    queryKey: ["referendum-results", slug],
    queryFn: () => getResults(slug || "referendum-2030"),
    enabled: Boolean(slug),
    refetchInterval: 30000,
  });

  const isLoading = referendumQuery.isLoading;
  const isError = referendumQuery.isError || !referendumQuery.data;
  const isOpen = referendumQuery.data?.status === "open";
  const start = formatDateTime(referendumQuery.data?.starts_at, lang);
  const end = formatDateTime(referendumQuery.data?.ends_at, lang);
  const totalVotes = resultsQuery.data?.total_votes;

  return (
    <section className="container pb-16" aria-live="polite">
      <div className="panel grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-2 p-6 md:p-8 divide-y md:divide-y-0 md:divide-x divide-line/60">
        <div className="flex items-start gap-4 pb-6 md:pb-0 md:px-4 first:pl-0">
          <div className="p-3.5 bg-crema-dark rounded-xl text-brand-red flex-shrink-0" aria-hidden="true">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CalendarDays className="w-6 h-6" />}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-wider text-muted uppercase">{t("status.summary.currentStatus")}</span>
            <div className="flex items-center gap-2 mt-1">
              {isOpen && !isError ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" aria-hidden="true"></span>
                  <span className="text-xl font-bold text-green leading-none">{t("status.summary.open")}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-red" aria-hidden="true"></span>
                  <span className="text-xl font-bold text-brand-red leading-none">{t("status.summary.closed")}</span>
                </>
              )}
            </div>
            <span className="text-xs text-muted font-medium mt-1">
              {isOpen && !isError ? t("status.summary.openText") : t("status.summary.closedText")}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-6 md:pt-0 md:px-6">
          <div className="p-3.5 bg-crema-dark rounded-xl text-muted flex-shrink-0" aria-hidden="true">
            <Clock3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black tracking-wider text-muted uppercase">{t("status.summary.start")}</span>
            <span className="text-base font-bold text-ink mt-1.5 leading-none">{start.date}</span>
            <span className="text-sm font-bold text-brand-red mt-1">{start.time}</span>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-6 md:pt-0 md:px-6">
          <div className="p-3.5 bg-crema-dark rounded-xl text-muted flex-shrink-0" aria-hidden="true">
            <Clock3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black tracking-wider text-muted uppercase">{t("status.summary.end")}</span>
            <span className="text-base font-bold text-ink mt-1.5 leading-none">{end.date}</span>
            <span className="text-sm font-bold text-brand-red mt-1">{end.time}</span>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-6 md:pt-0 md:px-6 last:pr-0">
          <div className="p-3.5 bg-crema-dark rounded-xl text-muted flex-shrink-0" aria-hidden="true">
            <UsersRound className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-wider text-muted uppercase">{t("status.summary.participation")}</span>
            <span className="text-xl font-extrabold text-ink mt-1 leading-none">
              {typeof totalVotes === "number" ? formatNumber(totalVotes, lang) : "--"}
            </span>
            <span className="text-xs text-muted font-medium mt-1">{t("status.summary.votesCast")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StatusSummaryWidget({ lang = "ca" }: StatusSummaryWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusSummaryPanel lang={lang} />
    </QueryClientProvider>
  );
}
