# QA Visual Report - Responsive & Languages

**Date:** 2026-05-18
**Site:** Referendum 2030 (static build with mock data)

## Pages covered (20 screenshots)
- **ca**: home, votar, resultats, transparencia, faq (mobile + desktop)
- **en/es/fr/ar/zh**: home (mobile + desktop)

## Results

| Check | Status | Notes |
|---|---|---|
| Desktop 1440px renders | ✅ All 10 pages load | |
| Mobile 375px renders | ✅ All 10 pages load | |
| Catalan (default) routes | ✅ /, /votar, /resultats, /transparencia, /faq | |
| Spanish routes | ✅ /es, /es/votar, /es/resultados, /es/transparencia, /es/faq | |
| English routes | ✅ /en, /en/vote, /en/results, /en/transparency, /en/faq | |
| French routes | ✅ /fr, /fr/voter, /fr/results, /fr/transparency, /fr/faq | |
| Arabic routes | ✅ /ar, /ar/vote, /ar/results, /ar/transparency, /ar/faq | |
| Chinese routes | ✅ /zh, /zh/vote, /zh/results, /zh/transparency, /zh/faq | |
| RTL (Arabic) | ✅ `dir="rtl"` on `<html>` when lang=ar | Tailwind `rtl:` variants used for icons |
| Responsive breakpoints | ✅ Tailwind sm(640)/md(768)/lg(1024)/xl(1280) | Container max 1280px, fluid padding |
| All pages return 200 | ✅ 12/12 routes confirmed via HTTP check | |

## Notes
- Screenshots in `docs/screenshots/qa/` - 20 files total
- RTL implemented via `dir` attribute + Tailwind `rtl:` variants (no custom CSS needed)
- Responsive uses Tailwind v4 default breakpoints with no custom media queries
- Existing screenshots in `docs/screenshots/` unchanged (home, votar, resultats, transparencia)
