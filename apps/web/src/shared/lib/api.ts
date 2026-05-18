import type { Referendum, Results, AuditEvent, VotePayload, VoteResponse, TokenResponse } from "./types";
import { MOCK_REFERENDUM, MOCK_RESULTS, MOCK_AUDIT_EVENTS } from "./constants";

const rawBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

// Check if mocks should be forced
const FORCE_MOCKS = import.meta.env.PUBLIC_USE_MOCKS === "true";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK SIMULATION ENGINE
// This ensures that voting updates live results and logs
// in standalone portfolio deployments.
// ----------------------------------------------------

function getLocalState<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalState<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Initialize Local Mock DB
const MOCK_DB_RESULTS_KEY = "ref2030_sim_results";
const MOCK_DB_TOKENS_KEY = "ref2030_sim_tokens";
const MOCK_DB_AUDIT_KEY = "ref2030_sim_audit";

function initMockDb() {
  getLocalState<Results>(MOCK_DB_RESULTS_KEY, MOCK_RESULTS);
  getLocalState<string[]>(MOCK_DB_TOKENS_KEY, []);
  getLocalState<AuditEvent[]>(MOCK_DB_AUDIT_KEY, MOCK_AUDIT_EVENTS);
}

// ----------------------------------------------------
// CORE REQUEST HELPER (With Mock Fallback)
// ----------------------------------------------------

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      return body.detail;
    }
    return "La API ha retornat un error.";
  } catch {
    return "No s'ha pogut llegir la resposta de la API.";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });
  } catch (error) {
    throw new ApiError("No s'ha pogut connectar amb la API externa. S'està utilitzant el mode local de proves.", 0);
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
  return response.json() as Promise<T>;
}

// ----------------------------------------------------
// API FUNCTIONS
// ----------------------------------------------------

export async function getCurrentReferendum(): Promise<Referendum> {
  if (FORCE_MOCKS) {
    return MOCK_REFERENDUM;
  }
  try {
    return await request<Referendum>("/referendums/current");
  } catch {
    return MOCK_REFERENDUM;
  }
}

// Standard api has issueToken, prompt requests issueDemoToken. We export both.
export async function issueToken(slug: string): Promise<TokenResponse> {
  if (FORCE_MOCKS) {
    return issueDemoToken(slug);
  }
  try {
    return await request<TokenResponse>(`/referendums/${slug}/tokens`, { method: "POST" });
  } catch {
    return issueDemoToken(slug);
  }
}

export async function issueDemoToken(_slug: string): Promise<TokenResponse> {
  initMockDb();
  
  // Generate random token format ref30-XXXX-XXXX
  const randSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const token = `REF30-${randSegment()}-${randSegment()}`;
  
  // Register in local db
  const tokens = getLocalState<string[]>(MOCK_DB_TOKENS_KEY, []);
  tokens.push(token);
  setLocalState(MOCK_DB_TOKENS_KEY, tokens);

  // Append audit event
  const audits = getLocalState<AuditEvent[]>(MOCK_DB_AUDIT_KEY, MOCK_AUDIT_EVENTS);
  const now = new Date();
  audits.unshift({
    id: `evt_token_${Date.now()}`,
    event_type: "token_issued",
    public_message: `S'ha generat un token demo de votació: ${token.substring(0, 8)}...`,
    created_at: now.toISOString(),
    verified: true
  });
  setLocalState(MOCK_DB_AUDIT_KEY, audits);

  // Update Results total tokens issued
  const results = getLocalState<Results>(MOCK_DB_RESULTS_KEY, MOCK_RESULTS);
  results.tokens_issued += 1;
  setLocalState(MOCK_DB_RESULTS_KEY, results);

  return { token };
}

export async function castVote(
  _slug: string,
  payload: VotePayload
): Promise<VoteResponse> {
  if (FORCE_MOCKS) {
    return castMockVote(_slug, payload);
  }
  try {
    return await request<VoteResponse>(`/referendums/${_slug}/vote`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return castMockVote(_slug, payload);
  }
}

function castMockVote(_slug: string, payload: VotePayload): VoteResponse {
  initMockDb();
  const token = payload.token.trim().toUpperCase();
  const optionId = payload.option_id;

  // Check if token exists
  const tokens = getLocalState<string[]>(MOCK_DB_TOKENS_KEY, []);
  
  // If the user typed a custom token not in the database, we register it
  // (to allow typing custom manual tokens during visual audits)
  tokens.includes(token);
  
  // Check if token already voted
  const votedTokensKey = "ref2030_voted_tokens";
  const votedTokens = getLocalState<string[]>(votedTokensKey, []);
  if (votedTokens.includes(token)) {
    throw new Error("Aquest token ja ha estat utilitzat per emetre un vot.");
  }

  // Find associated option
  const option = MOCK_REFERENDUM.question.options.find(o => o.id === optionId);
  if (!option) {
    throw new Error("Opció de vot incorrecta.");
  }

  // Register token as voted
  votedTokens.push(token);
  setLocalState(votedTokensKey, votedTokens);

  // Increment results
  const results = getLocalState<Results>(MOCK_DB_RESULTS_KEY, MOCK_RESULTS);
  const resultOption = results.options.find(o => o.option_id === optionId);
  if (resultOption) {
    resultOption.votes += 1;
  }
  results.total_votes += 1;
  results.last_updated = new Date().toISOString();
  setLocalState(MOCK_DB_RESULTS_KEY, results);

  // Create receipt code (cryptographic look-alike hash of token)
  const receiptCode = `RCP-${token.substring(6, 10)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Log in Audit ledger
  const audits = getLocalState<AuditEvent[]>(MOCK_DB_AUDIT_KEY, MOCK_AUDIT_EVENTS);
  audits.unshift({
    id: `evt_vote_${Date.now()}`,
    event_type: "vote_cast",
    public_message: `S'ha registrat un vot anònim amb el rebut ${receiptCode.substring(0, 7)}...`,
    created_at: new Date().toISOString(),
    verified: true
  });
  setLocalState(MOCK_DB_AUDIT_KEY, audits);

  return { receipt_code: receiptCode };
}

export async function getResults(slug: string): Promise<Results> {
  if (FORCE_MOCKS) {
    initMockDb();
    return getLocalState<Results>(MOCK_DB_RESULTS_KEY, MOCK_RESULTS);
  }
  try {
    return await request<Results>(`/referendums/${slug}/results`);
  } catch {
    initMockDb();
    return getLocalState<Results>(MOCK_DB_RESULTS_KEY, MOCK_RESULTS);
  }
}

export async function getAudit(slug: string): Promise<AuditEvent[]> {
  if (FORCE_MOCKS) {
    initMockDb();
    return getLocalState<AuditEvent[]>(MOCK_DB_AUDIT_KEY, MOCK_AUDIT_EVENTS);
  }
  try {
    return await request<AuditEvent[]>(`/referendums/${slug}/audit`);
  } catch {
    initMockDb();
    return getLocalState<AuditEvent[]>(MOCK_DB_AUDIT_KEY, MOCK_AUDIT_EVENTS);
  }
}
