import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getResults } from "../../lib/api";

const queryClient = new QueryClient();

function ResultsPanel() {
  const resultsQuery = useQuery({
    queryKey: ["results", "referendum-2030"],
    queryFn: () => getResults("referendum-2030"),
  });

  if (resultsQuery.isLoading) {
    return (
      <div className="panel flex items-center gap-3 p-6" aria-live="polite">
        <Loader2 className="animate-spin" aria-hidden="true" />
        Carregant resultats...
      </div>
    );
  }

  if (resultsQuery.isError || !resultsQuery.data) {
    return (
      <div className="panel p-6" role="alert">
        <p className="error">No s'han pogut carregar els resultats agregats.</p>
      </div>
    );
  }

  const data = resultsQuery.data.options.map((option) => ({
    name: option.label,
    votes: option.votes,
    percent:
      resultsQuery.data.total_votes === 0
        ? 0
        : Math.round((option.votes / resultsQuery.data.total_votes) * 100),
  }));

  return (
    <section className="grid gap-6">
      <div className="panel flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">{resultsQuery.data.referendum}</h2>
          <p className="text-[var(--muted)]">Total de vots demo: {resultsQuery.data.total_votes}</p>
        </div>
        <button className="btn btn-secondary w-fit" type="button" onClick={() => resultsQuery.refetch()}>
          <RefreshCw size={18} aria-hidden="true" />
          Actualitzar
        </button>
      </div>

      <div className="panel overflow-x-auto p-4">
        <div className="min-w-[560px]" aria-label="Grafica de resultats agregats">
          <BarChart
            width={760}
            height={320}
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" fill="#8f1d2c" name="Vots" />
          </BarChart>
        </div>
      </div>

      <div className="panel overflow-x-auto p-4">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Resultats agregats del referendum demo</caption>
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="p-3">Opció</th>
              <th className="p-3">Vots</th>
              <th className="p-3">Percentatge</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr className="border-b border-[var(--line)]" key={row.name}>
                <td className="p-3 font-bold">{row.name}</td>
                <td className="p-3">{row.votes}</td>
                <td className="p-3">{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ResultsWidget() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResultsPanel />
    </QueryClientProvider>
  );
}
