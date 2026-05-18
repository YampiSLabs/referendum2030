export interface MockAuditEvent {
  id: string;
  event_type: "referendum_created" | "token_issued" | "vote_cast" | "results_viewed";
  public_message: string;
  created_at: string;
  verified: boolean;
}

export const MOCK_AUDIT_EVENTS: MockAuditEvent[] = [
  {
    id: "evt_1",
    event_type: "referendum_created",
    public_message: "S'ha creat el referèndum i configurat les opcions oficials.",
    created_at: "2030-05-12T08:15:21Z",
    verified: true
  },
  {
    id: "evt_2",
    event_type: "token_issued",
    public_message: "S'ha emès un token anònim de votació.",
    created_at: "2030-05-12T09:02:11Z",
    verified: true
  },
  {
    id: "evt_3",
    event_type: "vote_cast",
    public_message: "S'ha registrat un vot de manera completament segura.",
    created_at: "2030-05-12T18:43:07Z",
    verified: true
  },
  {
    id: "evt_4",
    event_type: "results_viewed",
    public_message: "S'han consultat els resultats públics agregats.",
    created_at: "2030-05-18T20:00:15Z",
    verified: true
  }
];
