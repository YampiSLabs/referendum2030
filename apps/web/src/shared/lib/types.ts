export interface ReferendumOption {
  id: number;
  label: string;
  order: number;
}

export interface ReferendumQuestion {
  id: number;
  text: string;
  options: ReferendumOption[];
}

export interface Referendum {
  title: string;
  slug: string;
  description: string;
  is_current: boolean;
  question: ReferendumQuestion;
  starts_at?: string;
  ends_at?: string;
  total_voters_census?: number;
}

export interface ResultsOption {
  option_id: number;
  label: string;
  votes: number;
}

export interface Results {
  referendum: string;
  slug: string;
  total_votes: number;
  options: ResultsOption[];
  last_updated: string;
  tokens_issued: number;
}

export interface AuditEvent {
  id: string;
  event_type: "referendum_created" | "token_issued" | "vote_cast" | "results_viewed";
  public_message: string;
  created_at: string;
  verified: boolean;
}

export interface VotePayload {
  token: string;
  option_id: number;
}

export interface VoteResponse {
  receipt_code: string;
}

export interface TokenResponse {
  token: string;
}
