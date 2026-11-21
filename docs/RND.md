# ComboFinder v2 — R&D Notes

This document records what was wrong with ComboFinder v1, what was researched to fix it, and what v2 ships.
It is meant to be read by a reviewer, interviewer or future contributor.

---

## 1. What ComboFinder does

A merchant (or a shopper) has a product catalogue: product number/SKU, name, price, and often category,
stock, discount, description, supplier, dates. They want to answer questions like:

* "Which **single products** cost between ₹490 and ₹510?"
* "Which **bundles of 2–4 products** add up to between ₹490 and ₹510?" (gift hampers, combo offers,
  cart-filling to reach a free-shipping threshold, budget kits)
* …then **share** the answer: download it as a spreadsheet, or email it.

Formally, the combo search is the **bounded subset-sum range enumeration** problem: given `n` prices,
list subsets of size `kMin..kMax` whose sum lies in `[L, U]`. Subset-sum is NP-complete in general, so
the engineering goal is to be *output-sensitive* (cost tracks the number of answers, not `n^k`), to never
freeze the UI, and to degrade gracefully when the answer set explodes.

---

## 2. Gap analysis of v1

| # | Area | v1 behaviour | Impact |
|---|------|--------------|--------|
| G1 | CSV parsing | `content.split("\n")` + `line.split(",")` | Breaks on quoted fields (`"Laptop, 15 inch"`), CRLF, BOM, `;`/tab delimiters. Columns silently shift → wrong prices. |
| G2 | Price parsing | `parseFloat(value)` | `"$1,200"` → `1`, `"₹1,20,000"` → `1`, `"1.234,56 €"` → `1.234`. Silently wrong totals. |
| G3 | File formats | `.csv` only | No Excel (`.xlsx/.xls`), OpenDocument, TSV or JSON; no multi-sheet workbooks. Most catalogues live in Excel. |
| G4 | Column mapping | First header containing "name"/"price" | `ProductNo` matched as name (contains "product"); no type check of the data itself. |
| G5 | Search algorithm | Brute-force O(n²) pairs + O(n³) triples (triples only if n ≤ 100) | 5 000 products ⇒ 12.5 M pair checks; triples silently skipped above 100 rows; max bundle size fixed at 3; no single-item mode. |
| G6 | Responsiveness | Runs on the main thread inside `setTimeout` | UI freezes on large files; no progress, no cancel. |
| G7 | Result explosion | Every match pushed into an array | A wide range on 1 000 items can produce millions of combos → tab crash. |
| G8 | Money arithmetic | Floating point | `0.1 + 0.2 = 0.30000000000000004` → boundary matches dropped/added. |
| G9 | Results UI | Every row rendered with a staggered animation (`delay: index * 0.05`) | 2 000 results ⇒ last row appears after 100 s; DOM bloat. No search/sort/paging. |
| G10 | Export | Print and email only | No download as CSV/Excel/JSON (a core ask). |
| G11 | Email API | Client posts arbitrary `to/subject/html` to an open endpoint | Open relay for spam/phishing; product names injected into HTML unescaped; unbounded payload (50 MB). |
| G12 | Secrets | `server/.env` (SMTP user + app password) is committed to a public repo | Credential leak. **Rotate the password.** |
| G13 | Tooling | Create React App (deprecated Feb 2025), unused `@tensorflow/tfjs` (~MBs), theme classes like `blue:bg-…` that Tailwind never generates | Slow builds, dead CSS, misleading code. |
| G14 | Content | Footer says "Created by John Doe"; email logo file is 0 bytes | Polish. |
| G15 | Domain | Discount, stock and category columns are ignored | Can't do "only in-stock", "one per category", "price after discount". |

---

## 3. Research & decisions

### 3.1 Parsing

| Option | Notes | Decision |
|--------|-------|----------|
| Hand-written splitter | What v1 did; wrong for RFC 4180 | ✗ |
| **Papa Parse 5** | RFC 4180 compliant, delimiter auto-detect, BOM handling, streaming, ~20 KB gz | ✓ CSV/TSV/TXT |
| `xlsx` from npm (0.18.5) | Abandoned on npm; known CVEs (prototype pollution CVE-2023-30533, ReDoS CVE-2024-22363) | ✗ |
| **SheetJS CE from cdn.sheetjs.com (0.20.3)** | Official distribution, patched, reads xlsx/xlsm/xlsb/xls/ods/numbers, writes xlsx | ✓ — **lazy loaded** (dynamic `import()`), so users who only upload CSV never download it |
| JSON | Native `JSON.parse`; accept `[{…}]` or `{ "products": [{…}] }` / any first array property | ✓ |

### 3.2 Price normalisation

Real catalogues contain `$1,200.00`, `₹ 1,20,000`, `1.234,56 €`, `(12.50)`, `12.5 USD`, `—`.
Algorithm (`src/lib/price.js`):

1. Strip currency symbols/codes and spaces; treat `(x)` as negative.
2. If both `,` and `.` appear, the **right-most** one is the decimal separator.
3. If only one separator type appears: it is a thousands separator when every group after it has exactly 3 digits
   (`1,200` / `1,20,000`), otherwise it is the decimal separator (`12,5`).
4. Convert to **integer minor units (cents/paise)** — all sums are exact integer maths (fixes G8).

### 3.3 Column auto-mapping

Two signals combined into a confidence score (`src/lib/columns.js`):

* **Header signal** – normalised header compared against synonym lists per role
  (`price ← price, mrp, cost, amount, rate, unit price…`, `sku ← product no, item code, id…`).
  Exact synonym = 1.0, word match = 0.75, substring = 0.5. Negative cues prevent `ProductNo` → name.
* **Content signal** – profile each column: % parseable as price, % unique, average length, yes/no ratio.
  Price must be ≥ 80 % numeric; name prefers high-uniqueness text; stock accepts numbers or yes/no.

Assignment is greedy by score with one column per role. The user can override every role in the mapper.

### 3.4 Combination engine

Let prices be sorted ascending, `p[0] ≤ … ≤ p[n-1]`, with prefix sums `P`.

| k | Algorithm | Cost |
|---|-----------|------|
| 1 | Two binary searches for `[L, U]` | O(log n + m) |
| 2 | For each `i`, binary-search the `j > i` window `[L−p[i], U−p[i]]` | O(n log n + m) vs v1's O(n²) |
| ≥3 | Depth-first search with **branch-and-bound** pruning, last level by binary search | output-sensitive |

**Pruning bounds** at depth with partial sum `s`, `r` items still to pick, next index `i`:

* *Lower bound*: cheapest completion is `p[i] + … + p[i+r−1]` (= `P[i+r] − P[i]`). If `s + that > U` → **break**
  — every later `i` is at least as expensive, so the whole remaining branch is dead.
* *Upper bound*: most expensive completion is the `r` largest prices (`P[n] − P[n−r]`). If `s + that < L` →
  the branch can never reach the range → **break** (indices only get cheaper relative to that maximum).
  For the per-`i` check we use `s + p[i] + (largest r−1 after i)` and `continue` when it is too small.

Both bounds are O(1) thanks to prefix sums, so every visited node is on a path that *can* still produce an answer
or is cut immediately. This is the classic bounded-enumeration technique for subset-sum / knapsack listing.

**Constraints**, applied inside the DFS so they also prune: only in-stock, one-per-category, must-include
products (forced into every combo) and excluded products.

**Result explosion (G7)** — two mechanisms:

1. **Streaming top-K with a bounded binary heap.** Matches are scored (closest to a target, cheapest, most
   expensive, fewest items, best discount saving) and pushed into a heap of size *K* (default 5 000).
   Memory is O(K) regardless of how many matches exist; each insert is O(log K).
2. **Exact counting for k ≤ 2** (binary-search window sizes) and a **work budget** for k ≥ 3
   (default 25 M visited nodes). The UI reports "showing best 5 000 of 1 234 567" or "search stopped at budget".

**Off the main thread (G6)** — the engine is a pure function run inside a **Web Worker**; it posts progress
every ~100 ms. Cancel = `worker.terminate()` (a busy synchronous loop cannot receive messages) and a fresh
worker is created for the next search.

**Why not meet-in-the-middle / DP?** MITM is ideal for "does *any* subset hit the target" over all sizes,
but here sizes are small (≤ 6) and the user wants the actual lists, so sorted DFS + bounds is simpler and
output-sensitive. Pseudo-polynomial DP over price would need O(n·U) memory in cents (500 000 × n) and still
has to backtrack every subset.

### 3.5 Results & export

* Paged table (no thousands of animated DOM rows), client-side text search, sorting, expandable rows with all
  extra columns.
* Exports: **CSV** (RFC 4180 quoting + spreadsheet **formula-injection guard** — cells starting with
  `= + - @` are prefixed with `'`), **Excel workbook** with *Summary / Combos / Line items* sheets, **JSON**.
* **Email**: the browser sends *structured data only* (range + combos, capped). The server validates the
  address, escapes every value into a fixed template, attaches the CSV, rate-limits per IP and checks the
  `Origin` against an allow-list. It is no longer an open HTML relay (G11).

### 3.6 Tooling

* **Vite 7** replaces CRA: instant dev server, native Web Worker support (`new Worker(new URL(...), { type: "module" })`),
  code-splitting of SheetJS.
* **Vitest** unit tests for price parsing, file parsing, column inference and the combo engine
  (brute-force cross-check on random data).
* Removed `@tensorflow/tfjs` and the dead per-colour theme classes.

---

## 4. Benchmarks (Node 24, single thread, pairs + triples, range 490.00–510.00)

Run `npm run bench` to reproduce. The script asserts that v1 and v2 report the **same match count**.

| Products | v1 brute force | v2 engine (top 5 000 kept) | Matches |
|---------:|---------------:|---------------------------:|--------:|
| 100 | 3.9 ms | 9.8 ms | 2 023 |
| 500 | 63.6 ms | 62.9 ms | 237 858 |
| 1 000 | 514 ms | 97 ms | 1 938 472 |
| 5 000 | (minutes) | 1.37 s | 232 307 299 |
| 20 000 | (hours) | 23.4 s | 14 599 366 498 |

Notes: v1 could not even attempt triples above 100 products, and storing 1.9 M matches as objects would have used
hundreds of MB. v2 holds only the best 5 000 in memory while still counting all matches. At small *n* the fixed
cost of sorting and prefix sums makes v2 slightly slower in absolute terms, but both finish in under 10 ms there.
In the browser the default work budget (25 M nodes) stops very wide searches early and labels the result *partial*.

---

## 5. Future work

* Quantities (pick the same product twice) — bounded knapsack enumeration.
* Server-side search for 100 k+ row catalogues.
* Saved searches / shareable links.
