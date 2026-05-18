import { z } from "zod";
import { env } from "../../../shared/lib/env";
import { fetcher } from "../../../shared/lib/fetcher";
import { MOCK_AUDIT_EVENTS } from "../../../entities/audit-event/mocks/audit.mock";
import { AuditEventSchema } from "./schemas";
import type { AuditEvent } from "./types";

const MOCK_AUDIT_KEY = "ref2030_sim_audit";

export async function getAudit(slug: string): Promise<AuditEvent[]> {
  if (env.PUBLIC_USE_MOCKS) {
    if (typeof window === "undefined") {
      return z.array(AuditEventSchema).parse(MOCK_AUDIT_EVENTS);
    }

    const saved = window.localStorage.getItem(MOCK_AUDIT_KEY);
    if (!saved) {
      window.localStorage.setItem(MOCK_AUDIT_KEY, JSON.stringify(MOCK_AUDIT_EVENTS));
      return z.array(AuditEventSchema).parse(MOCK_AUDIT_EVENTS);
    }

    return z.array(AuditEventSchema).parse(JSON.parse(saved));
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/${slug}/logs/`);
  return z.array(AuditEventSchema).parse(data);
}
