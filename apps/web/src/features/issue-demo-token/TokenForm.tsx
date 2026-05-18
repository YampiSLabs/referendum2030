import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Check, Clipboard } from "lucide-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { issueDemoToken } from "../../features/voting/api/castVote";
import { useTranslations } from "../../shared/i18n/translations";
import type { Locale } from "../../shared/i18n/translations";

interface TokenFormProps {
  referendumSlug: string;
  onTokenReady: (token: string) => void;
  initialToken?: string;
  lang?: Locale;
}

export default function TokenForm({ referendumSlug, onTokenReady, initialToken = "", lang = "ca" }: TokenFormProps) {
  const [copied, setCopied] = useState(false);
  const [activeToken, setActiveToken] = useState(initialToken);
  const t = useTranslations(lang);

  // Dynamically define schema with localized messages
  const tokenSchema = useMemo(() => z.object({
    token: z.string().min(12, t("token.error.invalid")),
  }), [t]);

  type TokenFormValues = z.infer<typeof tokenSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: initialToken },
  });

  async function generateToken() {
    try {
      const response = await issueDemoToken(referendumSlug);
      setValue("token", response.token, { shouldValidate: true });
      setActiveToken(response.token);
      onTokenReady(response.token);
    } catch {
      // Keep demo UI quiet; validation/error state is handled by the voting flow.
    }
  }

  function submit(values: TokenFormValues) {
    setActiveToken(values.token);
    onTokenReady(values.token);
  }

  function copyToClipboard() {
    if (!activeToken) return;
    navigator.clipboard.writeText(activeToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form className="grid gap-4.5" onSubmit={handleSubmit(submit)}>
      <div className="field">
        <label htmlFor="token-input" className="font-outfit font-bold text-gray-900 flex justify-between items-center">
          <span>{t("token.label")}</span>
          {activeToken && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="text-[11px] font-bold text-brand-red hover:underline flex items-center gap-1 cursor-pointer"
              aria-label={t("token.copy.aria")}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green" />
                  <span className="text-green">{t("token.copied")}</span>
                </>
              ) : (
                <>
                  <Clipboard size={12} />
                  <span>{t("token.copy")}</span>
                </>
              )}
            </button>
          )}
        </label>
        
        <div className="flex gap-2">
          <input
            id="token-input"
            type="text"
            placeholder="REF30-XXXX-XXXX"
            autoComplete="off"
            aria-describedby={errors.token ? "token-error" : "token-help"}
            className="flex-grow font-mono font-bold uppercase tracking-wider text-sm border-2"
            {...register("token", {
              onChange: (e) => {
                setActiveToken(e.target.value);
                onTokenReady(e.target.value);
              }
            })}
          />
          <button 
            className="btn btn-secondary px-6 shrink-0 min-h-[48px]" 
            type="submit" 
            disabled={isSubmitting}
            aria-label={t("token.use.aria")}
          >
            {t("token.use")}
          </button>
        </div>

        {errors.token ? (
          <p id="token-error" className="error" role="alert">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
            </svg>
            {errors.token.message}
          </p>
        ) : (
          <p id="token-help" className="text-[11px] text-muted font-medium mt-0.5">
            {t("token.help")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black tracking-wider text-muted uppercase">{t("token.or")}</span>
        <button 
          className="btn flex-1 min-h-[48px]" 
          type="button" 
          onClick={generateToken}
          aria-label={t("token.generate.aria")}
        >
          <KeyRound size={16} aria-hidden="true" />
          {t("token.generate")}
        </button>
      </div>
    </form>
  );
}
