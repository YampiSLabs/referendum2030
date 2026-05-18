import { expect, test } from "@playwright/test";

const PROD_API_BASE_URL = (
  process.env.PUBLIC_API_BASE_URL ?? "https://referendum.yampi.eu/api/v1"
).replace(/\/$/, "");
const PROD_USE_MOCKS = process.env.PUBLIC_USE_MOCKS ?? "false";

test.beforeAll(() => {
  if (PROD_USE_MOCKS !== "false") {
    throw new Error(
      "Production smoke test requires PUBLIC_USE_MOCKS=false. " +
      "Run: PUBLIC_USE_MOCKS=false PUBLIC_API_BASE_URL=https://referendum.yampi.eu/api/v1 pnpm test:e2e:prod"
    );
  }
  if (!PROD_API_BASE_URL.includes("referendum.yampi.eu")) {
    throw new Error(
      "Production smoke test must target referendum.yampi.eu. " +
      `Got: ${PROD_API_BASE_URL}`
    );
  }
});

test("healthcheck returns ok", async ({ request }) => {
  const resp = await request.get(`${PROD_API_BASE_URL}/healthz/`);
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body.status).toBe("ok");
});

test("current referendum has question and options", async ({ request }) => {
  const resp = await request.get(`${PROD_API_BASE_URL}/referendums/current/`);
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body.slug).toBeTruthy();
  expect(body.question).toBeTruthy();
  expect(body.question.options.length).toBeGreaterThanOrEqual(2);
});

test("full voting flow: token -> vote -> results -> audit", async ({ request }) => {
  const refResp = await request.get(`${PROD_API_BASE_URL}/referendums/current/`);
  const ref = await refResp.json();
  const slug = ref.slug;

  const tokResp = await request.post(`${PROD_API_BASE_URL}/referendums/${slug}/tokens/`);
  expect([200, 201]).toContain(tokResp.status());
  const tok = await tokResp.json();
  expect(tok.token).toMatch(/^REF30-/);

  const voteResp = await request.post(`${PROD_API_BASE_URL}/referendums/${slug}/votes/`, {
    data: { token: tok.token, option_id: 1 },
  });
  expect([200, 201]).toContain(voteResp.status());
  const vote = await voteResp.json();
  expect(vote.success).toBe(true);
  expect(vote.receipt_code).toMatch(/^RCP-/);

  const resResp = await request.get(`${PROD_API_BASE_URL}/referendums/${slug}/results/`);
  expect(resResp.status()).toBe(200);
  const results = await resResp.json();
  expect(results.total_votes).toBeGreaterThan(0);

  const audResp = await request.get(`${PROD_API_BASE_URL}/referendums/${slug}/audit/`);
  expect(audResp.status()).toBe(200);
  const audit = await audResp.json();
  expect(Array.isArray(audit)).toBe(true);
  expect(audit.length).toBeGreaterThan(0);
});

test("landing page loads and shows disclaimer against prod API", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Refer/);
  await expect(page.getByText(/simulaci[oó]|fict/i).first()).toBeVisible();
});
