# ComboFinder v2: UI/UX research & design spec

The goal was a dark-only, premium, fully responsive interface for a data tool, plus the product patterns users
expect from modern SaaS. This doc records the principles used, what each requested pattern became in the product,
and what was deliberately left out.

## 1. Principles applied

| Principle | Source idea | How it shows up |
|-----------|-------------|-----------------|
| **Mental models** | Users expect a file tool to work like "upload → configure → results", in that order | A 4-step flow (Upload → Map → Budget → Results), mirrored in the sidebar, mobile tab bar and command palette |
| **Recognition over recall** (NN/g heuristic #6) | Don't make people remember options | Size presets, ±% tolerance chips, live "≈ N products in range" preview, shortcut hints shown next to actions |
| **Hick's law / psychology of choice** | More options means slower decisions | Rules hidden behind sensible defaults; advanced filters collapse until there are results |
| **Visibility of system status** (heuristic #1) | Always show what's happening | Step status dots, progress bar with live match count, skeleton loaders, "exhaustive / partial" badges, search timing |
| **Error prevention & recovery** (heuristics #5, #9) | Stop bad input early and offer a way back | Inline validation with fixes ("Set max to $1,200"), undo on exclude, confirm before clearing data, error boundary with a reset |
| **Behavioural economics: defaults & anchoring** | People keep defaults | Default range anchored on the catalogue's median once data loads; ranking defaults to "closest to target" |
| **Fitts's law** | Big, close targets on touch | 44 px minimum touch targets, bottom tab bar on mobile, sticky action bar in results |

## 2. Visual direction: "Black, white and one signal colour"

Dark-only (light theme removed). An early "aurora + glassmorphism + purple gradient" draft was dropped after review
because it read as **AI-generated**. The tells were: indigo→fuchsia gradients, gradient text, glowing blobs, glass
panels, pill badges everywhere, and keyboard hints on every control. The final direction is **Swiss / editorial
minimalism** with one confident accent:

* **Canvas:** neutral near-black `#0a0a0b` (not blue-tinted) with a single 3.5% white light at the top. No
  animated background.
* **Surfaces:** solid `#111113` cards with a 1 px `white/8%` hairline. Elevation = one step lighter, no shadows, no blur.
* **Colour, used for meaning only:**
  * **Acid lime `#CDF54B`:** the one signature colour. Primary button, active navigation, "within budget"
    histogram bars and prices, match totals, the highlighter mark on the headline word "budget", and the logo.
    Lime on black is ~15:1 contrast.
  * **Coral `#FF8A65`:** discounts and savings only.
  * Red for errors. Everything else is white/zinc. Disabled buttons turn neutral grey, so lime always means
    "you can act".
* **Type does the hierarchy:** Geist + Geist Mono, large tight-tracked headline, tabular numerals for money,
  plain-text summaries ("182 matches · 13 pairs, 169 sets of 3") instead of chip clusters.
* **Simplicity:** the main flow shows only *file → From/To → items per result → Find matches*. Sorting, limits,
  target ± %, and rules sit behind **More options**. Export is one **Download** menu plus **Email**.
* **Motion:** 150 ms colour transitions, spring only for dialogs; no decorative animation.

## 3. Requested patterns → implementation

| Pattern | Implementation |
|---------|----------------|
| Persistent sidebar navigation | Desktop (≥ 1024 px): fixed left sidebar with 4 steps, done-checks, counts and a lime active marker; section tracking is rAF-throttled. Mobile/tablet: top bar + bottom tab bar |
| Command palette | `Ctrl/⌘ K`: fuzzy search over ~25 actions (upload, sample, run, export, presets, sorting, rules, navigation, clear) with arrow keys + Enter |
| Keyboard shortcuts | `⌘K` palette · `⌘↵` run search · `/` filter results · `U` upload · `S` sample · `1–4` jump to step · `?` shortcut sheet · `Esc` close/cancel |
| Skeleton loaders | Insights skeleton while parsing, results skeleton while the first search runs |
| Loading & empty states | Every panel has an empty state. "No matches" offers one-click recovery: widen ±10%, allow more items, clear rules |
| Optimistic UI | Pin/exclude update the table instantly (row dims and is struck through) and re-run the search in the background |
| Autosave | Settings and the last loaded catalogue (if < 2 MB) autosave to `localStorage` (debounced 400 ms) and restore on return, with an "Undo restore" action |
| Debouncing | Results filter (200 ms), autosave (400 ms), live range preview |
| Throttling | Worker progress (100 ms), scroll-spy via IntersectionObserver |
| Smart form validation | Live inline messages: min > max, negative values, range below the cheapest bundle or above the most expensive, each with a "fix it" button |
| Bulk actions on a list | Row checkboxes, select page / select all filtered, sticky bulk bar: export selected (CSV/Excel/JSON), exclude products, clear selection |
| Reusable table component | `DataTable`: column config, sortable headers, selection, pagination, sticky header. Used for both **Results** and **Catalogue** |
| Advanced data filtering | Results: text search, bundle-size chips, category filter, total sub-range. Catalogue: text, category, "only in budget range" toggle |
| Status indicators ("TR" read as "time-to-result") | Search time badge, live match counter during search, step completion indicators |
| Onboarding | Three numbered steps under the headline plus a "Try it with sample data" link in the upload card (no dismissible tour) |
| Destructive action protection | Confirm dialog for "Clear catalogue". Exclude is reversible with Undo |
| Graceful error recovery | React error boundary (retry / reset saved session), toast "Retry" on email failure, worker crash falls back to the main thread |
| Custom 404 | Unknown paths render a branded 404 page (Vercel rewrites all routes to the SPA) |
| Mobile-optimised layout | 1 column below 768 px, bottom tab bar, card-style result rows instead of a wide table, full-height sheets for dialogs |

**Not implemented (and why):** *referral/affiliate pages* and *onboarding data capture* (collecting user details).
ComboFinder has no accounts or backend database, and its privacy promise ("your file never leaves the browser") is a
feature. Adding sign-up data capture would contradict it. Both become sensible once accounts exist.

## 4. SEO checklist applied (single-page tool)

* Title 50–60 chars, unique meta description, canonical URL, Open Graph + Twitter tags
* `SoftwareApplication` JSON-LD schema
* `robots.txt` with sitemap; `sitemap.xml`
* Crawlable `<noscript>` content describing the tool; one `<h1>`; semantic landmarks (`nav`, `main`, `aside`)
* Core Web Vitals: SheetJS lazy-loaded, fonts `display=swap` + preconnect, no layout shift from skeletons (fixed heights)
* Image alt text everywhere; custom 404

Not applicable without a real backend or content site: GSC/GA4 setup, topic clusters, comparison pages. Those are
deployment/marketing tasks for the site owner.

## 5. Tools referenced but not used

The Mobbin MCP, Watermelon UI and Impeccable skills mentioned in the brief are not installed in this environment, so
their principles (real-app references, component quality, removing generic "AI" styling: uneven spacing, random
gradients, emoji icons, low-contrast grey text) were applied by hand.
