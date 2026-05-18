import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Ticket, FileText, Pointer, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { getCurrentReferendum } from "../../../entities/referendum/api/getReferendum";
import { castVote } from "../../../features/voting/api/castVote";
import TokenForm from "../../../features/issue-demo-token/TokenForm";
import { getRoute } from "../../../shared/lib/routes";
import { useTranslations, translateQuestion, translateOptionLabel } from "../../../shared/i18n/translations";
import type { Locale } from "../../../shared/i18n/translations";

const queryClient = new QueryClient();

interface VoteWidgetProps {
  lang?: Locale;
}

function VotePanel({ lang = "ca" }: { lang: Locale }) {
  const [token, setToken] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState("");
  const t = useTranslations(lang);

  const referendumQuery = useQuery({
    queryKey: ["current-referendum"],
    queryFn: getCurrentReferendum,
  });

  const voteMutation = useMutation({
    mutationFn: () => {
      if (!referendumQuery.data || selectedOptionId === null || !token) {
        throw new Error(t("vote.error.missing"));
      }
      return castVote((referendumQuery.data as any)?.slug, {
        token,
        option_id: selectedOptionId,
      });
    },
    onSuccess: (data) => {
      setReceipt(data.receipt_code);
      // Clean query params
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    },
  });

  const selectedOption = useMemo(
    () => (referendumQuery.data as any)?.question.options.find((option: any) => option.id === selectedOptionId),
    [referendumQuery.data, selectedOptionId]
  );

  // Read URL query parameter on load
  useEffect(() => {
    if (typeof window !== "undefined" && referendumQuery.data) {
      const params = new URLSearchParams(window.location.search);
      const opt = params.get("option")?.toLowerCase();
      if (opt === "si" || opt === "sí") {
        setSelectedOptionId(1);
      } else if (opt === "no") {
        setSelectedOptionId(2);
      } else if (opt === "blanc" || opt === "enblanc") {
        setSelectedOptionId(3);
      }
    }
  }, [referendumQuery.data]);

  // Mask token for visual review (e.g. REF30-A8F2-XXXX -> REF30..8C2D)
  const maskedToken = useMemo(() => {
    if (!token) return "";
    const cleanToken = token.trim();
    if (cleanToken.length < 12) return cleanToken;
    return `${cleanToken.substring(0, 5)}..${cleanToken.substring(cleanToken.length - 4)}`;
  }, [token]);

  if (referendumQuery.isLoading) {
    return (
      <div className="panel flex flex-col items-center justify-center p-12 text-muted font-bold gap-3" aria-live="polite">
        <Loader2 className="animate-spin text-brand-red w-8 h-8" aria-hidden="true" />
        <span className="font-outfit">{t("vote.loading")}</span>
      </div>
    );
  }

  if (referendumQuery.isError || !referendumQuery.data) {
    return (
      <div className="panel p-8 flex flex-col items-center text-center gap-4" role="alert">
        <div className="p-3 bg-brand-red/10 rounded-full text-brand-red">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h3 className="font-outfit font-black text-ink text-lg">{t("vote.error.server")}</h3>
          <p className="text-xs text-muted font-semibold mt-1">{t("vote.error.serverText")}</p>
        </div>
      </div>
    );
  }

  // Vote Cast Success View
  if (receipt) {
    return (
      <section className="panel p-8 md:p-10 flex flex-col items-center text-center gap-6 animate-fade-in" aria-live="polite">
        <div className="p-4.5 bg-green/10 rounded-full text-green shadow-inner">
          <CheckCircle2 size={46} aria-hidden="true" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="font-outfit text-3xl font-black text-gray-900">{t("vote.success.title")}</h2>
          <p className="text-sm text-muted font-semibold max-w-md mx-auto leading-relaxed">
            {t("vote.success.body")}
          </p>
        </div>

        <code className="rounded-xl border-2 border-line bg-crema-dark p-4 text-xl font-mono font-black text-brand-red tracking-wider shadow-inner w-full max-w-sm">
          {receipt}
        </code>

        <div className="flex flex-wrap gap-4 mt-2 justify-center w-full">
          <a className="btn" href={getRoute("resultats", lang)}>
            {t("vote.success.btnResults")}
          </a>
          <button 
            className="btn btn-secondary" 
            type="button" 
            onClick={() => {
              setToken("");
              setSelectedOptionId(null);
              setReceipt("");
            }}
          >
            {t("vote.success.btnAgain")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-8">
      
      {/* STEP 1: Obtén el teu token */}
      <article className="panel p-6 md:p-8 grid grid-cols-12 gap-5 relative">
        <div className="col-span-12 sm:col-span-1 flex justify-start">
          <div className="w-13 h-13 rounded-full bg-brand-gold-soft border border-brand-gold/30 text-brand-red flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
            <Ticket size={22} />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-11 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-outfit w-5 h-5 rounded-full bg-brand-red text-white font-bold text-[10px] flex items-center justify-center shadow-sm">1</span>
            <h3 className="font-outfit text-lg font-black text-gray-900">{t("vote.step1.title")}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed font-semibold">
            {t("vote.step1.body")}
          </p>
          <div className="mt-2 bg-crema-dark/45 p-4 rounded-xl border border-line/45">
            <TokenForm 
              referendumSlug={(referendumQuery.data as any)?.slug} 
              onTokenReady={setToken} 
              initialToken={token}
              lang={lang}
            />
          </div>
        </div>
      </article>

      {/* STEP 2: Revisa la pregunta */}
      <article className="panel p-6 md:p-8 grid grid-cols-12 gap-5 relative">
        <div className="col-span-12 sm:col-span-1 flex justify-start">
          <div className="w-13 h-13 rounded-full bg-brand-gold-soft border border-brand-gold/30 text-brand-red flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
            <FileText size={22} />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-11 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-outfit w-5 h-5 rounded-full bg-brand-red text-white font-bold text-[10px] flex items-center justify-center shadow-sm">2</span>
            <h3 className="font-outfit text-lg font-black text-gray-900">{t("vote.step2.title")}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed font-semibold">
            {t("vote.step2.body")}
          </p>
          
          <div className="mt-2 p-5 bg-brand-gold-soft border border-brand-gold/25 rounded-xl relative overflow-hidden flex items-start gap-3">
            <span className="font-serif text-3xl text-brand-red leading-none font-bold select-none">“</span>
            <p className="font-outfit text-base font-extrabold text-ink leading-snug">
              {translateQuestion((referendumQuery.data as any)?.question.text, lang)}
            </p>
            <span className="font-serif text-3xl text-brand-red leading-none font-bold select-none self-end">”</span>
          </div>
        </div>
      </article>

      {/* STEP 3: Escull una opció */}
      <fieldset className="panel p-6 md:p-8 grid grid-cols-12 gap-5 relative">
        <legend className="sr-only">3. {t("vote.step3.title")}</legend>
        <div className="col-span-12 sm:col-span-1 flex justify-start">
          <div className="w-13 h-13 rounded-full bg-brand-gold-soft border border-brand-gold/30 text-brand-red flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
            <Pointer size={22} />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-11 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-outfit w-5 h-5 rounded-full bg-brand-red text-white font-bold text-[10px] flex items-center justify-center shadow-sm">3</span>
            <h3 className="font-outfit text-lg font-black text-gray-900">{t("vote.step3.title")}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed font-semibold">
            {t("vote.step3.body")}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2.5">
            {(referendumQuery.data as any)?.question.options.map((option: any) => {
              const isSelected = selectedOptionId === option.id;
              let styleClass = "";
              if (option.id === 1) { // Sí
                styleClass = isSelected 
                  ? "border-green bg-green text-white shadow-md shadow-green/10" 
                  : "border-green/50 text-green hover:bg-green hover:text-white";
              } else if (option.id === 2) { // No
                styleClass = isSelected 
                  ? "border-brand-red bg-brand-red text-white shadow-md shadow-brand-red/10" 
                  : "border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white";
              } else { // En blanc
                styleClass = isSelected 
                  ? "border-gray-500 bg-gray-500 text-white shadow-md shadow-gray-500/10" 
                  : "border-gray-300 text-gray-500 hover:bg-gray-500 hover:text-white";
              }

              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`font-outfit font-black text-sm py-3 px-5 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${styleClass}`}
                  aria-pressed={isSelected}
                >
                  {translateOptionLabel(option.label, lang)}
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* STEP 4: Revisa i confirma */}
      <article className="panel p-6 md:p-8 grid grid-cols-12 gap-5 relative">
        <div className="col-span-12 sm:col-span-1 flex justify-start">
          <div className="w-13 h-13 rounded-full bg-brand-gold-soft border border-brand-gold/30 text-brand-red flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-11 flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="font-outfit w-5 h-5 rounded-full bg-brand-red text-white font-bold text-[10px] flex items-center justify-center shadow-sm">4</span>
            <h3 className="font-outfit text-lg font-black text-gray-900">{t("vote.step4.title")}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed font-semibold">
            {t("vote.step4.body")}
          </p>

          <div className="mt-1 overflow-hidden border border-line rounded-xl bg-crema/20">
            <table className="w-full text-left text-xs font-semibold">
              <tbody>
                <tr className="border-b border-line/65">
                  <td className="p-4 text-muted">{t("vote.confirm.option")}</td>
                  <td className="p-4 font-bold text-right text-gray-900">
                    {selectedOption ? (
                      <span className={`inline-block py-1 px-3 rounded-full text-[10px] font-black text-white ${
                        selectedOption.id === 1 ? "bg-green" : selectedOption.id === 2 ? "bg-brand-red" : "bg-gray-400"
                      }`}>
                        {translateOptionLabel(selectedOption.label, lang)}
                      </span>
                    ) : (
                      <span className="text-brand-red font-bold">{t("vote.confirm.pendingOption")}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-muted">{t("vote.confirm.token")}</td>
                  <td className="p-4 font-mono font-bold text-right text-ink">
                    {maskedToken ? maskedToken : <span className="text-brand-red font-bold font-sans">{t("vote.confirm.pendingToken")}</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {voteMutation.isError ? (
            <p className="error border border-brand-red/20 bg-brand-red/5 p-3.5 rounded-lg flex items-center gap-2 mt-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
              </svg>
              <span>{voteMutation.error.message}</span>
            </p>
          ) : null}

          <div className="flex flex-col gap-3.5 mt-2">
            <button
              className="btn w-full min-h-[52px]"
              type="button"
              disabled={!token || selectedOptionId === null || voteMutation.isPending}
              onClick={() => voteMutation.mutate()}
            >
              {voteMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={18} />
                  {t("vote.confirm.submitting")}
                </>
              ) : (
                t("vote.confirm.submit")
              )}
            </button>
            
            <div className="flex justify-center items-center gap-1.5 text-[10.5px] font-bold text-muted">
              <Lock size={12} className="text-brand-red" />
              <span>{t("vote.confirm.warning")}</span>
            </div>
          </div>
        </div>
      </article>

    </div>
  );
}

export default function VoteWidget({ lang = "ca" }: VoteWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <VotePanel lang={lang} />
    </QueryClientProvider>
  );
}
