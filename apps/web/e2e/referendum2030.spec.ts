import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("landing keeps the fictitious civic disclaimer and key navigation visible", async ({ page }) => {
  await expect(page).toHaveTitle(/Refer/);
  await expect(page.getByText(/simulaci[oó]|fict/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /votar/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /result/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /transpar/i }).first()).toBeVisible();
});

test("demo voter can generate token, cast one vote, and see aggregate results", async ({ page }) => {
  await page.goto("/votar");

  await page.getByRole("button", { name: /genera.*token/i }).click();
  await expect(page.getByRole("textbox", { name: /token/i })).toHaveValue(
    /REF30-[A-Z0-9]{4}-[A-Z0-9]{4}/,
  );

  await page.getByRole("button", { name: /^s[ií]$/i }).click();
  await page.getByRole("button", { name: /confirm/i }).click();

  await expect(page.getByText(/registrat|registrado|registered|success/i).first()).toBeVisible();
  await expect(page.getByText(/RCP-[A-Z0-9]{4}-[A-Z0-9]{4}/)).toBeVisible();

  await page.goto("/resultats");
  await expect(page.getByRole("heading", { name: /resultats/i })).toBeVisible();
  const resultsTable = page.getByRole("table").first();
  await expect(resultsTable).toBeVisible();
  await expect(resultsTable.getByRole("cell", { name: /^s[ií]$/i }).first()).toBeVisible();
});

test("localized public routes render without depending on Astro SSR", async ({ page }) => {
  for (const route of ["/en/vote", "/es/votar", "/fr/voter", "/zh/vote", "/ar/vote"]) {
    await page.goto(route);
    await expect(page.locator("body")).toContainText(/2030/);
    await expect(page.getByRole("main")).toBeVisible();
  }
});
