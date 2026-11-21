# ComboFinder

**Find every product, or every bundle of 2–6 products, whose total price lands inside your budget.**
Upload a catalogue in any common format, map the columns (auto-detected), set a range, and export the answer.

Live: https://combofinder.vercel.app

## Features

- **Any spreadsheet in.** CSV, TSV, TXT, Excel (`.xlsx .xlsm .xlsb .xls`), OpenDocument (`.ods`), Numbers and JSON.
  Multi-sheet workbooks, title rows above the header, quoted commas, BOMs and `; | \t` delimiters are all handled.
- **Smart column mapping.** Name, price, SKU, category, stock, discount and description are inferred from header
  synonyms *and* the column's actual values, each with a confidence score. Every other column is kept as extra info.
- **Real-world prices.** `$1,200.50`, `₹ 1,20,000`, `1.234,56 €`, `(12.50)`, `Rs. 499`. All money is held in integer
  cents, so sums are exact.
- **Data-quality report.** Skipped rows with reasons, duplicates, price distribution histogram (your range is
  highlighted), median/IQR, category breakdown.
- **Fast, exact search engine.** Binary search for singles and the last item of every bundle, plus branch-and-bound DFS
  with O(1) prefix-sum pruning for bundles. Results stream into a bounded top-K heap, so memory stays flat even with
  millions of matches. See [docs/RND.md](docs/RND.md).
- **Never freezes.** The search runs in a Web Worker with live progress and cancel.
- **Rules.** Discounted price, in-stock only, one product per category, always-include (pin) and exclude.
- **Ranking.** Closest to a target, lowest or highest total, fewest items, biggest discount saving.
- **Results UI.** Paged, filterable table with expandable product details.
- **Export.** CSV (formula-injection safe), Excel workbook (Summary / Combos / Line items), JSON, print, and email
  with a CSV attachment.
- **Privacy.** Files are parsed in the browser. Only an explicit "Email" sends data (the top 200 combos) to the API.

## Tech

React 18 · Vite 7 · Tailwind CSS · Framer Motion · Papa Parse · SheetJS CE 0.20.3 (lazy-loaded) · Web Workers ·
Vitest · Node.js / Express / Nodemailer (mail API)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (parser, mapping, engine vs brute force, exporters)
npm run bench      # v1 vs v2 engine benchmark
npm run build      # production build → build/
```

Mail API:

```bash
cd server
cp .env.example .env   # fill in SMTP settings
npm install
npm start              # http://localhost:5000
```

Point the frontend at your API with `VITE_API_URL=http://localhost:5000` in a root `.env.local`.

> Rollup is pinned to its WebAssembly build (`overrides` in `package.json`) because some Windows machines block
> native `.node` binaries via Application Control. Remove the override to use the native build.

## Project layout

```
src/
  lib/
    parse.js          multi-format import + header-row detection
    price.js          locale-tolerant price parsing, integer cents, currency formatting
    columns.js        column-role inference (header synonyms + value profiling)
    dataset.js        products + data-quality report + histogram
    comboEngine.js    search engine (pure function)
    comboWorker.js    Web Worker wrapper
    useComboSearch.js React hook: worker lifecycle, progress, cancel
    exporters.js      CSV / XLSX / JSON export
    samples.js        sample catalogue (CSV / XLSX / JSON)
  components/         UI
server/               Express mail API (structured payload → server-rendered email)
docs/RND.md           gap analysis, research and design decisions
scripts/bench.js      benchmark
```
