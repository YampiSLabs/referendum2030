const rawBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ReferendumOption {
  id: number;
  label: string;
  order: number;
}

export interface Referendum {
  title: string;
  slug: string;
  description: string;
  is_current: boolean;
  question: {
    text: string;
    options: ReferendumOption[];
  };
}

export interface Results {
  referendum: string;
  slug: string;
  total_votes: number;
  options: Array<{
    option_id: number;
    label: string;
    votes: number;
  }>;
}

export interface AuditEvent {
  event_type: string;
  public_message: string;
  created_at: string;
}

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
  } catch {
    throw new ApiError("No s'ha pogut connectar amb la API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
  return response.json() as Promise<T>;
}

export function getCurrentReferendum(): Promise<Referendum> {
  return request<Referendum>("/referendums/current");
}

export function issueToken(slug: string): Promise<{ token: string }> {
  return request<{ token: string }>(`/referendums/${slug}/tokens`, { method: "POST" });
}

export function castVote(
  slug: string,
  payload: { token: string; option_id: number },
): Promise<{ receipt_code: string }> {
  return request<{ receipt_code: string }>(`/referendums/${slug}/vote`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getResults(slug: string): Promise<Results> {
  return request<Results>(`/referendums/${slug}/results`);
}

export function getAudit(slug: string): Promise<AuditEvent[]> {
  return request<AuditEvent[]>(`/referendums/${slug}/audit`);
}

