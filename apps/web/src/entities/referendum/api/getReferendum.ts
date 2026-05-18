import { env } from "../../../shared/lib/env";
import { fetcher } from "../../../shared/lib/fetcher";
import { MOCK_REFERENDUM } from "../../../entities/referendum/mocks/referendum.mock";
import { ReferendumSchema } from "../model/schemas";
import type { Referendum } from "../model/types";

export async function getCurrentReferendum(): Promise<Referendum> {
  if (env.PUBLIC_USE_MOCKS) {
    // Validate mock through Zod to guarantee schema safety
    return ReferendumSchema.parse(MOCK_REFERENDUM);
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/current/`);
  return ReferendumSchema.parse(data);
}

export async function getReferendum(slug: string): Promise<Referendum> {
  if (env.PUBLIC_USE_MOCKS) {
    return ReferendumSchema.parse(MOCK_REFERENDUM);
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/${slug}/`);
  return ReferendumSchema.parse(data);
}
