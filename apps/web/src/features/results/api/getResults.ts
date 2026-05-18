import { env } from "../../../shared/lib/env";
import { fetcher } from "../../../shared/lib/fetcher";
import { MOCK_RESULTS } from "../../../entities/result/mocks/results.mock";
import { ResultsSchema } from "./schemas";
import type { Results } from "./types";

const MOCK_RESULTS_KEY = "ref2030_sim_results";

export async function getResults(slug: string): Promise<Results> {
  if (env.PUBLIC_USE_MOCKS) {
    if (typeof window === "undefined") {
      return ResultsSchema.parse(MOCK_RESULTS);
    }

    const saved = window.localStorage.getItem(MOCK_RESULTS_KEY);
    if (!saved) {
      // Initialize with our base mock results
      window.localStorage.setItem(MOCK_RESULTS_KEY, JSON.stringify(MOCK_RESULTS));
      return ResultsSchema.parse(MOCK_RESULTS);
    }

    return ResultsSchema.parse(JSON.parse(saved));
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/${slug}/results/`);
  return ResultsSchema.parse(data);
}
