import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, ShieldCheck, Ticket, CheckSquare, PlusCircle } from "lucide-react";
import { getAudit } from "../api/getAudit";
import { useTranslations, translateLedgerMessage } from "../../../shared/i18n/translations";
import type { Locale } from "../../../shared/i18n/translations";

const queryClient = new QueryClient();

interface AuditLedgerProps {
  lang?: Locale;
}

function LedgerList({ lang = "ca" }: { lang: Locale }) {
  const t = useTranslations(lang);
  const auditQuery = useQuery({
    queryKey: ["audit-events", "referendum-2030"],
    queryFn: () => getAudit("referendum-2030"),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  if (auditQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted font-bold gap-3" aria-live="polite">
        <Loader2 className="animate-spin text-brand-red w-8 h-8" aria-hidden="true" />
        <span className="font-outfit text-xs">{t("audit.loading")}</span>
      </div>
    );
  }

  if (auditQuery.isError || !auditQuery.data) {
    return (
      <div className="p-6 text-center text-brand-red font-bold text-xs" role="alert">
        <p>{t("audit.error")}</p>
      </div>
    );
  }

  const events = auditQuery.data;

  // Format localized date strings matching the active locale
  const formatEventDate = (isoString: string) => {
    const d = new Date(isoString);
    const localeMap = {
      ca: "ca-ES",
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      ar: "ar-EG",
      zh: "zh-CN"
    };
    return d.toLocaleDateString(localeMap[lang] || "ca-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="grid gap-4">
      {/* Header refresh controls */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-2">
        <span className="font-outfit text-xs font-black text-ink uppercase tracking-wide">
          {t("audit.ledger")} ({events.length})
        </span>
        <button 
          className="text-brand-red font-outfit text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0" 
          type="button" 
          onClick={() => auditQuery.refetch()}
          aria-label={t("audit.update.aria")}
        >
          <RefreshCw size={12} className={auditQuery.isRefetching ? "animate-spin" : ""} aria-hidden="true" />
          {t("audit.update")}
        </button>
      </div>

      {/* Events List Feed */}
      <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <p className="text-xs text-muted text-center py-8 font-semibold">{t("audit.empty")}</p>
        ) : (
          events.map((evt) => (
            <article 
              key={evt.id} 
              className="p-4 border border-line rounded-xl bg-white hover:border-brand-gold/45 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                {/* Status icon mapping */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  evt.event_type === "vote_cast" ? "bg-green/5 text-green" :
                  evt.event_type === "token_issued" ? "bg-brand-gold/10 text-[#d97706]" :
                  "bg-brand-red/5 text-brand-red"
                }`} aria-hidden="true">
                  {evt.event_type === "vote_cast" && <CheckSquare size={18} />}
                  {evt.event_type === "token_issued" && <Ticket size={18} />}
                  {evt.event_type === "referendum_created" && <PlusCircle size={18} />}
                  {evt.event_type === "results_viewed" && <ShieldCheck size={18} />}
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-gray-900 leading-snug">
                    {translateLedgerMessage(evt.public_message, lang)}
                  </p>
                  <span className="text-[10px] text-muted font-bold mt-0.5">{formatEventDate(evt.created_at)}</span>
                </div>
              </div>

              {/* High trust verified stamp badge */}
              <div className="flex items-center gap-1.5 py-1 px-3 bg-green/10 text-green rounded-full text-[9px] font-black tracking-wider uppercase flex-shrink-0 self-end sm:self-center select-none shadow-sm shadow-green/5">
                <ShieldCheck size={12} aria-hidden="true" />
                <span>{t("audit.verified")}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default function AuditLedger({ lang = "ca" }: AuditLedgerProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LedgerList lang={lang} />
    </QueryClientProvider>
  );
}
