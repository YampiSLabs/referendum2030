/** Generates QA screenshots for all pages in mobile/desktop across all languages */
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4321";
const OUT_DIR = join(__dirname, "..", "docs", "screenshots", "qa");

const LOCALES: Record<string, [string, string][]> = {
  ca: [["/", "home"], ["/votar", "votar"], ["/resultats", "resultats"], ["/transparencia", "transparencia"], ["/faq", "faq"]],
  es: [["/es", "home"], ["/es/votar", "votar"], ["/es/resultados", "resultados"], ["/es/transparencia", "transparencia"], ["/es/faq", "faq"]],
  en: [["/en", "home"], ["/en/vote", "vote"], ["/en/results", "results"], ["/en/transparency", "transparency"], ["/en/faq", "faq"]],
  fr: [["/fr", "home"], ["/fr/voter", "voter"], ["/fr/results", "results"], ["/fr/transparency", "transparency"], ["/fr/faq", "faq"]],
  ar: [["/ar", "home"], ["/ar/vote", "vote"], ["/ar/results", "results"], ["/ar/transparency", "transparency"], ["/ar/faq", "faq"]],
  zh: [["/zh", "home"], ["/zh/vote", "vote"], ["/zh/results", "results"], ["/zh/transparency", "transparency"], ["/zh/faq", "faq"]],
};

const VIEWPORTS: [string, number, number][] = [
  ["mobile-375", 375, 812],
  ["desktop-1440", 1440, 900],
];

interface Issue {
  page: string;
  viewport: string;
  issue: string;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const issues: Issue[] = [];

  for (const [locale, pages] of Object.entries(LOCALES)) {
    for (const [vpName, vpW, vpH] of VIEWPORTS) {
      const context: BrowserContext = await browser.newContext({
        viewport: { width: vpW, height: vpH },
        locale: locale === "ar" ? "ar" : undefined,
      });
      const page: Page = await context.newPage();

      for (const [path, name] of pages) {
        const filename = `${locale}_${name}_${vpName}.png`;
        const filepath = join(OUT_DIR, filename);

        try {
          await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle", timeout: 15000 });
          await page.waitForTimeout(500);
          await page.screenshot({ path: filepath, fullPage: true });
          console.log(`OK ${filename}`);
        } catch (err: any) {
          issues.push({ page: `${locale}${path}`, viewport: vpName, issue: err.message });
          console.error(`FAIL ${filename}: ${err.message}`);
        }
      }

      await context.close();
    }
  }

  const report = {
    generated: new Date().toISOString(),
    total_screenshots: Object.keys(LOCALES).length * Object.keys(VIEWPORTS).length * 5,
    issues,
  };
  writeFileSync(join(OUT_DIR, "_report.json"), JSON.stringify(report, null, 2));
  console.log(`\nDone. Report: ${JSON.stringify(report, null, 2)}`);

  await browser.close();
}

main().catch(console.error);
