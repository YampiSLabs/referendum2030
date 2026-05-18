import { env } from "../../../shared/lib/env";
import { fetcher, FetcherError } from "../../../shared/lib/fetcher";
import { TokenResponseSchema, VoteResponseSchema } from "./schemas";
import type { TokenResponse, VotePayload, VoteResponse } from "./types";

// Unique keys for offline simulation
const MOCK_TOKENS_KEY = "ref2030_sim_tokens";
const MOCK_VOTED_KEY = "ref2030_voted_tokens";
const MOCK_RESULTS_KEY = "ref2030_sim_results";
const MOCK_AUDIT_KEY = "ref2030_sim_audit";

export async function issueDemoToken(slug: string): Promise<TokenResponse> {
  if (env.PUBLIC_USE_MOCKS) {
    if (typeof window === "undefined") {
      return TokenResponseSchema.parse({ token: "REF30-MOCK-ONLY", valid: true });
    }

    // Generate random 8 character string
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart1 = "";
    let randomPart2 = "";
    for (let i = 0; i < 4; i++) {
      randomPart1 += characters.charAt(Math.floor(Math.random() * characters.length));
      randomPart2 += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const token = `REF30-${randomPart1}-${randomPart2}`;

    // Read and update mock database in localStorage
    const tokens = JSON.parse(window.localStorage.getItem(MOCK_TOKENS_KEY) || "[]");
    tokens.push(token);
    window.localStorage.setItem(MOCK_TOKENS_KEY, JSON.stringify(tokens));

    // Append to live audit ledger feed
    const auditLogs = JSON.parse(window.localStorage.getItem(MOCK_AUDIT_KEY) || "[]");
    auditLogs.unshift({
      id: `evt_${Date.now()}`,
      event_type: "token_issued",
      public_message: `S'ha emès un token anònim de votació (${token.substring(0, 5)}..${token.substring(token.length - 2)}).`,
      created_at: new Date().toISOString(),
      verified: true
    });
    window.localStorage.setItem(MOCK_AUDIT_KEY, JSON.stringify(auditLogs));

    return TokenResponseSchema.parse({ token, valid: true });
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/${slug}/tokens/`, {
    method: "POST",
  });
  return TokenResponseSchema.parse(data);
}

export async function castVote(slug: string, payload: VotePayload): Promise<VoteResponse> {
  if (env.PUBLIC_USE_MOCKS) {
    if (typeof window === "undefined") {
      return VoteResponseSchema.parse({ success: true, receipt_code: "RCP-MOCK-ONLY", registered_at: new Date().toISOString() });
    }

    const token = payload.token.trim().toUpperCase();
    
    // Check if token exists in issued list
    const tokens = JSON.parse(window.localStorage.getItem(MOCK_TOKENS_KEY) || "[]");
    if (!tokens.includes(token)) {
      throw new FetcherError({
        status: 400,
        message: "Token no reconegut o no vàlid per a aquest simulacre.",
      });
    }

    // Check if token already voted
    const votedTokens = JSON.parse(window.localStorage.getItem(MOCK_VOTED_KEY) || "[]");
    if (votedTokens.includes(token)) {
      throw new FetcherError({
        status: 400,
        message: "Aquest token ja ha estat utilitzat per emetre un vot.",
      });
    }

    // Generate random receipt code RCP-XXXX-XXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let r1 = "";
    let r2 = "";
    for (let i = 0; i < 4; i++) {
      r1 += chars.charAt(Math.floor(Math.random() * chars.length));
      r2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const receiptCode = `RCP-${r1}-${r2}`;

    // Mark token as used
    votedTokens.push(token);
    window.localStorage.setItem(MOCK_VOTED_KEY, JSON.stringify(votedTokens));

    // Update results aggregates in localStorage
    const savedResults = window.localStorage.getItem(MOCK_RESULTS_KEY);
    let resultsObj = savedResults ? JSON.parse(savedResults) : null;
    if (!resultsObj) {
      // Default template results
      resultsObj = {
        referendum: "Referèndum 2030",
        slug: "referendum-2030",
        total_votes: 245730,
        tokens_issued: 245730,
        last_updated: "2030-05-18T20:05:00Z",
        options: [
          { option_id: 1, label: "Sí", votes: 128012 },
          { option_id: 2, label: "No", votes: 95132 },
          { option_id: 3, label: "En blanc", votes: 22586 }
        ]
      };
    }

    resultsObj.total_votes += 1;
    resultsObj.tokens_issued += 1;
    resultsObj.last_updated = new Date().toISOString();
    resultsObj.options = resultsObj.options.map((opt: any) => {
      if (opt.option_id === payload.option_id) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    window.localStorage.setItem(MOCK_RESULTS_KEY, JSON.stringify(resultsObj));

    // Append to live audit ledger feed
    const optLabel = payload.option_id === 1 ? "Sí" : payload.option_id === 2 ? "No" : "En blanc";
    const auditLogs = JSON.parse(window.localStorage.getItem(MOCK_AUDIT_KEY) || "[]");
    auditLogs.unshift({
      id: `evt_${Date.now()}`,
      event_type: "vote_cast",
      public_message: `S'ha registrat un vot anònim amb èxit. Opció: ${optLabel} (Rebut: ${receiptCode}).`,
      created_at: new Date().toISOString(),
      verified: true
    });
    window.localStorage.setItem(MOCK_AUDIT_KEY, JSON.stringify(auditLogs));

    return VoteResponseSchema.parse({
      success: true,
      receipt_code: receiptCode,
      registered_at: new Date().toISOString(),
    });
  }

  const data = await fetcher<any>(`${env.PUBLIC_API_BASE_URL}/referendums/${slug}/votes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return VoteResponseSchema.parse(data);
}
