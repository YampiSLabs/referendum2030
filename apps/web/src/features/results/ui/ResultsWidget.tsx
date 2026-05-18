import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { getResults } from "../api/getResults";
import { GlobalDonutChart, DemarcationBarChart } from "./ResultsChart";
import { translateOptionLabel, useTranslations } from "../../../shared/i18n/translations";
import type { Locale } from "../../../shared/i18n/translations";

const queryClient = new QueryClient();

interface ResultsWidgetProps {
  lang?: Locale;
}

function ResultsPanel({ lang = "ca" }: { lang: Locale }) {
  const t = useTranslations(lang);
  const resultsQuery = useQuery({
    queryKey: ["results", "referendum-2030"],
    queryFn: () => getResults("referendum-2030"),
    refetchInterval: 30000, // Automatic polling every 30 seconds
  });

  if (resultsQuery.isLoading) {
    return (
      <div className="panel flex flex-col items-center justify-center p-16 text-muted font-bold gap-3" aria-live="polite">
        <Loader2 className="animate-spin text-brand-red w-8 h-8" aria-hidden="true" />
        <span className="font-outfit">{t("results.loading")}</span>
      </div>
    );
  }

  if (resultsQuery.isError || !resultsQuery.data) {
    return (
      <div className="panel p-8 text-center text-brand-red font-bold" role="alert">
        <p>{t("results.error")}</p>
      </div>
    );
  }

  const resultsData = resultsQuery.data;
  const totalVotes = resultsData.total_votes;

  // Format options with percentages and class-colors
  const formattedRows = resultsData.options.map((opt) => {
    const percentVal = totalVotes === 0 ? 0 : (opt.votes / totalVotes) * 100;
    let label = opt.label;
    if (opt.option_id === 1 || opt.option_id === 2 || opt.option_id === 3) {
      label = translateOptionLabel(opt.label, opt.option_id, lang);
    }

    return {
      id: opt.option_id,
      label,
      votes: opt.votes,
      percent: percentVal.toFixed(1).replace(".", ","),
      colorClass: opt.option_id === 1 ? "bg-green shadow-sm shadow-green/10" : opt.option_id === 2 ? "bg-brand-red shadow-sm shadow-brand-red/10" : "bg-gray-400"
    };
  });

  // Local number formatter
  const formatVotes = (num: number) => {
    const localeMap = {
      ca: "ca-ES",
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      ar: "ar-EG",
      zh: "zh-CN"
    };
    return new Intl.NumberFormat(localeMap[lang] || "ca-ES").format(num);
  };

  const localeTimeMap = {
    ca: "ca-ES",
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    ar: "ar-EG",
    zh: "zh-CN"
  };

  return (
    <div className="grid gap-6">
      
      {/* Live Sync Controls */}
      <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black tracking-widest text-muted uppercase">{t("results.database")}</span>
          <h2 className="font-outfit text-xl font-extrabold text-ink mt-0.5">{resultsData.referendum}</h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted font-semibold mt-1">
            <span>{t("results.count.total")}: <strong>{formatVotes(totalVotes)}</strong> {t("results.count.demo")}</span>
            <span className="hidden sm:inline">·</span>
            <span>{t("results.count.updated")}: <strong>{new Date(resultsData.last_updated).toLocaleTimeString(localeTimeMap[lang] || "ca-ES", {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</strong></span>
          </div>
        </div>
        
        <button 
          className="btn btn-secondary py-2 px-5 min-h-[44px] text-xs shrink-0 self-start sm:self-center" 
          type="button" 
          onClick={() => resultsQuery.refetch()}
          aria-label={t("results.update.aria")}
        >
          <RefreshCw size={14} className={resultsQuery.isRefetching ? "animate-spin" : ""} aria-hidden="true" />
          {t("results.update")}
        </button>
      </div>

      {/* Live Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 1: Donut global chart */}
        <article className="panel p-6 sm:p-8 lg:col-span-4 flex flex-col justify-between gap-6">
          <div>
            <h3 className="font-outfit text-base font-extrabold text-ink relative pb-2.5">
              {t("results.global.title")}
              <span className="absolute bottom-0 left-0 w-8 h-[2.5px] bg-brand-red rounded-full"></span>
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap lg:flex-wrap xl:flex-nowrap">
            {/* Recharts Donut Pie */}
            <GlobalDonutChart totalVotes={totalVotes} options={resultsData.options} lang={lang} />

            {/* Legends Grid */}
            <div className="flex flex-col gap-4.5 w-full">
              {formattedRows.map((row) => (
                <div className="grid grid-cols-12 items-center gap-2" key={row.id}>
                  <div className="col-span-1 flex justify-center">
                    <span className={`w-3.5 h-3.5 rounded-full ${row.id === 1 ? "bg-green" : row.id === 2 ? "bg-brand-red" : "bg-slate-350"}`} style={{ backgroundColor: row.id === 3 ? "#cbd5e1" : undefined }}></span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-xs font-bold text-gray-700">{row.label}</span>
                  </div>
                  <div className="col-span-7 text-right flex flex-col">
                    <span className="text-sm font-black text-ink leading-none">{row.percent}%</span>
                    <span className="text-[9.5px] text-muted font-bold mt-1">{formatVotes(row.votes)} {t("results.chart.votes")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-line/65 pt-4 text-[10.5px] font-bold text-muted flex items-center justify-between">
            <span>{t("results.chart.votsTotalText")}</span>
            <span className="text-ink font-black">{formatVotes(totalVotes)} {t("results.chart.votes")}</span>
          </div>
        </article>

        {/* Panel 2: Bar charts by demarcation */}
        <article className="panel p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-outfit text-base font-extrabold text-ink relative pb-2.5">
              {t("results.demarcation.title")}
              <span className="absolute bottom-0 left-0 w-8 h-[2.5px] bg-brand-red rounded-full"></span>
            </h3>
          </div>

          {/* Recharts grouped bars graph */}
          <DemarcationBarChart lang={lang} />

          <div className="text-center">
            <span className="font-outfit text-[10.5px] font-black text-brand-red hover:underline cursor-pointer flex items-center justify-center gap-1.5">
              {t("results.demarcation.map")}
              <svg className="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </span>
          </div>
        </article>

        {/* Panel 3: Accessible details table */}
        <article className="panel p-6 sm:p-8 lg:col-span-3 flex flex-col justify-between gap-6">
          <div>
            <h3 className="font-outfit text-base font-extrabold text-ink relative pb-2.5">
              {t("results.table.title")}
              <span className="absolute bottom-0 left-0 w-8 h-[2.5px] bg-brand-red rounded-full"></span>
            </h3>
          </div>

          <div className="overflow-x-auto w-full flex-grow">
            <table className="w-full text-left text-xs border-collapse">
              <caption className="sr-only">{t("results.table.caption")}</caption>
              <thead>
                <tr className="border-b border-line/80 font-outfit text-muted uppercase tracking-wider text-[9.5px]">
                  <th className="pb-3 text-left">{t("results.table.option")}</th>
                  <th className="pb-3 text-right">{t("results.table.votes")}</th>
                  <th className="pb-3 text-right">{t("results.table.percent")}</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-ink">
                {formattedRows.map((row) => (
                  <tr className="border-b border-line/65 last:border-0 hover:bg-crema/25 transition-colors" key={row.id}>
                    <td className="py-3.5 text-left flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.id === 1 ? "bg-green" : row.id === 2 ? "bg-brand-red" : "bg-slate-350"}`} style={{ backgroundColor: row.id === 3 ? "#cbd5e1" : undefined }}></span>
                      <span className="font-bold">{row.label}</span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-medium">{formatVotes(row.votes)}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-brand-red">{row.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-line/75 pt-4 font-outfit text-xs font-black text-ink flex items-center justify-between">
            <span>{t("results.table.total")}</span>
            <span className="font-mono text-brand-red">{formatVotes(totalVotes)} (100%)</span>
          </div>
        </article>

      </div>
    </div>
  );
}

export default function ResultsWidget({ lang = "ca" }: ResultsWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ResultsPanel lang={lang} />
    </QueryClientProvider>
  );
}
