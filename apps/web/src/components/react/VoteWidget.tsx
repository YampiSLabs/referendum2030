import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Vote } from "lucide-react";
import { useMemo, useState } from "react";

import { castVote, getCurrentReferendum } from "../../lib/api";
import TokenForm from "./TokenForm";

const queryClient = new QueryClient();

function VotePanel() {
  const [token, setToken] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState("");
  const referendumQuery = useQuery({
    queryKey: ["current-referendum"],
    queryFn: getCurrentReferendum,
  });
  const voteMutation = useMutation({
    mutationFn: () => {
      if (!referendumQuery.data || selectedOptionId === null) {
        throw new Error("Selecciona una opció.");
      }
      return castVote(referendumQuery.data.slug, {
        token,
        option_id: selectedOptionId,
      });
    },
    onSuccess: (data) => {
      setReceipt(data.receipt_code);
    },
  });

  const selectedOption = useMemo(
    () => referendumQuery.data?.question.options.find((option) => option.id === selectedOptionId),
    [referendumQuery.data, selectedOptionId],
  );

  if (referendumQuery.isLoading) {
    return (
      <div className="panel flex items-center gap-3 p-6" aria-live="polite">
        <Loader2 className="animate-spin" aria-hidden="true" />
        Carregant referendum...
      </div>
    );
  }

  if (referendumQuery.isError || !referendumQuery.data) {
    return (
      <div className="panel p-6" role="alert">
        <p className="error">No s'ha pogut carregar el referendum demo.</p>
      </div>
    );
  }

  if (receipt) {
    return (
      <section className="panel grid gap-4 p-6" aria-live="polite">
        <CheckCircle2 size={36} className="text-[var(--green)]" aria-hidden="true" />
        <h2 className="text-2xl font-black">Vot demo registrat</h2>
        <p>Conserva aquest codi fictici de rebut:</p>
        <code className="rounded-md border border-[var(--line)] bg-white p-3 text-lg font-black">
          {receipt}
        </code>
        <a className="btn btn-secondary w-fit" href="/resultados">
          Veure resultats agregats
        </a>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="panel p-6">
        <h2 className="text-2xl font-black">{referendumQuery.data.title}</h2>
        <p className="mt-2 text-[var(--muted)]">{referendumQuery.data.description}</p>
      </div>

      <div className="panel p-6">
        <h3 className="text-xl font-black">1. Token demo</h3>
        <div className="mt-4">
          <TokenForm referendumSlug={referendumQuery.data.slug} onTokenReady={setToken} />
        </div>
      </div>

      <fieldset className="panel grid gap-4 p-6">
        <legend className="text-xl font-black">2. Opció de vot</legend>
        <p className="text-lg font-bold">{referendumQuery.data.question.text}</p>
        <div className="grid gap-3">
          {referendumQuery.data.question.options.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-md border border-[var(--line)] bg-white p-4"
              key={option.id}
            >
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
              />
              <span className="font-bold">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="panel grid gap-4 p-6">
        <h3 className="text-xl font-black">3. Revisió</h3>
        <p>
          Token: <strong>{token ? "preparat" : "pendent"}</strong>
        </p>
        <p>
          Opció: <strong>{selectedOption?.label || "pendent"}</strong>
        </p>
        {voteMutation.isError ? (
          <p className="error" role="alert">
            {voteMutation.error.message}
          </p>
        ) : null}
        <button
          className="btn w-fit"
          type="button"
          disabled={!token || selectedOptionId === null || voteMutation.isPending}
          onClick={() => voteMutation.mutate()}
        >
          <Vote size={18} aria-hidden="true" />
          {voteMutation.isPending ? "Registrant..." : "Confirmar vot demo"}
        </button>
      </div>
    </section>
  );
}

export default function VoteWidget() {
  return (
    <QueryClientProvider client={queryClient}>
      <VotePanel />
    </QueryClientProvider>
  );
}

