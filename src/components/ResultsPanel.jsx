import { useEffect, useMemo, useState } from "react"
import { Search, Pin, Ban, X, SlidersHorizontal } from "lucide-react"
import DataTable from "./ui/DataTable"
import ExportBar from "./ExportBar"
import { formatMoney, toCents } from "../lib/price"
import { SORTS } from "../lib/comboEngine"
import { useDebounced } from "../lib/hooks"

const sizeWord = (k) => (Number(k) === 1 ? "single products" : Number(k) === 2 ? "pairs" : `sets of ${k}`)

function ProductList({ items, priceField, pinned, excluded }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 leading-relaxed">
      {items.map((p, i) => (
        <span key={p.id} className="inline-flex items-baseline gap-1.5">
          {i > 0 && <span className="text-zinc-600">+</span>}
          <span className={excluded.includes(p.id) ? "text-zinc-600 line-through" : "text-zinc-100"}>
            {pinned.includes(p.id) && <Pin className="mr-1 inline h-3 w-3 -translate-y-px text-zinc-400" />}
            {p.name}
          </span>
          <span className="num text-[12px] text-zinc-500">{formatMoney(p[priceField])}</span>
        </span>
      ))}
    </div>
  )
}

function Details({ items, onPin, onExclude, pinned, excluded }) {
  return (
    <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.08] bg-ink-950">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-2 p-3 text-[13px] sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-zinc-100">
              {p.name} <span className="num text-zinc-400">{formatMoney(p.priceCents)}</span>
              {p.discountPct > 0 && <span className="num text-coral"> → {formatMoney(p.finalCents)} after {p.discountPct}% off</span>}
            </p>
            <p className="text-[12px] text-zinc-500">
              {[p.sku && `#${p.sku}`, p.category, p.inStock ? "In stock" : "Out of stock", ...Object.entries(p.extra).map(([k, v]) => `${k}: ${v}`)].filter(Boolean).join(" · ")}
            </p>
            {p.description && <p className="mt-1 text-[12px] text-zinc-400">{p.description}</p>}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button onClick={() => onPin(p.id)} className={`btn-secondary h-8 px-2.5 text-[12px] ${pinned.includes(p.id) ? "border-zinc-300 text-white" : ""}`}>
              <Pin className="h-3.5 w-3.5" /> {pinned.includes(p.id) ? "Always included" : "Always include"}
            </button>
            <button onClick={() => onExclude(p.id)} className="btn-secondary h-8 px-2.5 text-[12px]">
              <Ban className="h-3.5 w-3.5" /> {excluded.includes(p.id) ? "Excluded" : "Exclude"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ResultsPanel({ result, byId, categories, params, filterRef, onPin, onExclude, onExport, onEmail, exportBusy, stale }) {
  const [query, setQuery] = useState("")
  const [sizes, setSizes] = useState([])
  const [category, setCategory] = useState("")
  const [lo, setLo] = useState("")
  const [hi, setHi] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const debouncedQuery = useDebounced(query, 200)
  useEffect(() => setSelected(new Set()), [result.id]) // ranks change on re-run

  const { priceField } = result.params
  const pinned = params.mustInclude
  const excluded = params.exclude

  const rows = useMemo(() => result.combos.map((c, i) => ({ ...c, rank: i + 1 })), [result])
  const sizeOptions = Object.keys(result.bySize).map(Number)

  const filtered = useMemo(() => {
    const terms = debouncedQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const loC = lo === "" ? -Infinity : toCents(Number(lo))
    const hiC = hi === "" ? Infinity : toCents(Number(hi))
    const cat = category.toLowerCase()
    return rows.filter((c) => {
      if (sizes.length && !sizes.includes(c.items.length)) return false
      if (c.total < loC || c.total > hiC) return false
      const items = c.items.map((id) => byId.get(id))
      if (cat && !items.some((p) => p.category.toLowerCase() === cat)) return false
      if (terms.length) {
        const hay = items.map((p) => `${p.name} ${p.sku} ${p.category}`).join(" ").toLowerCase()
        if (!terms.every((t) => hay.includes(t))) return false
      }
      return true
    })
  }, [rows, byId, debouncedQuery, sizes, category, lo, hi])

  const activeFilters = (sizes.length ? 1 : 0) + (category ? 1 : 0) + (lo !== "" || hi !== "" ? 1 : 0)
  const clearFilters = () => {
    setQuery("")
    setSizes([])
    setCategory("")
    setLo("")
    setHi("")
  }
  const selectedCombos = rows.filter((r) => selected.has(r.rank))
  const target = result.target
  const touchesExcluded = (c) => c.items.some((id) => excluded.includes(id))
  const breakdown = Object.entries(result.bySize).map(([k, n]) => `${n.toLocaleString()} ${sizeWord(k)}`)

  const columns = [
    {
      id: "products",
      header: "Products",
      cell: (c) => <ProductList items={c.items.map((id) => byId.get(id))} priceField={priceField} pinned={pinned} excluded={excluded} />,
    },
    {
      id: "diff",
      header: "Off target",
      cell: (c) => {
        const d = c.total - target
        return <span className="num whitespace-nowrap text-[12px] text-zinc-500">{d === 0 ? "exact" : `${d > 0 ? "+" : "−"}${formatMoney(Math.abs(d))}`}</span>
      },
      sortValue: (c) => Math.abs(c.total - target),
      align: "right",
      hideBelow: "lg",
    },
    {
      id: "total",
      header: "Total",
      cell: (c) => (
        <div className="whitespace-nowrap">
          <span className="money font-medium">{formatMoney(c.total)}</span>
          {c.saving > 0 && <span className="num block text-[11px] text-coral">saves {formatMoney(c.saving)}</span>}
        </div>
      ),
      sortValue: (c) => c.total,
      align: "right",
    },
  ]

  return (
    <section id="results" tabIndex={-1} className="card scroll-mt-20 outline-none" aria-labelledby="results-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="results-title" className="text-[22px] font-semibold tracking-tight">
            {result.matches.toLocaleString()} {result.matches === 1 ? "match" : "matches"}
            {stale && <span className="ml-2 align-middle text-[13px] font-normal text-zinc-500">updating…</span>}
          </h2>
          <p className="mt-1 text-[13px] text-zinc-500">
            {formatMoney(result.params.min)} – {formatMoney(result.params.max)} · {breakdown.join(", ")}
          </p>
          <p className="mt-0.5 text-[12px] text-zinc-600">
            Sorted by {SORTS[result.params.sortBy].toLowerCase()} · found in {result.elapsedMs} ms
            {result.combos.length < result.matches && ` · showing the best ${result.combos.length.toLocaleString()}`}
            {!result.complete && <span className="text-amber-400"> · search stopped early, so narrow the range for every match</span>}
          </p>
        </div>
        <ExportBar onExport={(k) => onExport(k)} onEmail={onEmail} busy={exportBusy} />
      </div>

      <div className="divider my-5" />

      <div className="flex flex-wrap items-center gap-2 print-hide">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input ref={filterRef} className="input pl-9" placeholder="Search results" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search results" />
        </div>
        <button className="btn-secondary" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" /> Filter{activeFilters > 0 && ` (${activeFilters})`}
        </button>
        {(activeFilters > 0 || query) && (
          <button className="btn-ghost" onClick={clearFilters}>
            Reset
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 grid gap-4 rounded-lg border border-white/[0.08] bg-ink-950 p-4 sm:grid-cols-3 print-hide">
          <div>
            <span className="label">Items</span>
            <div className="flex flex-wrap gap-1.5">
              {sizeOptions.map((s) => (
                <button key={s} className="chip-btn" aria-pressed={sizes.includes(s)} onClick={() => setSizes((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))}>
                  {s === 1 ? "1" : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="f-cat">
              Includes category
            </label>
            <select id="f-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!categories.length}>
              <option value="">Any</option>
              {categories.map(([c]) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">Total between</span>
            <div className="flex items-center gap-2">
              <input className="input num" inputMode="decimal" type="number" placeholder="Min" value={lo} onChange={(e) => setLo(e.target.value)} aria-label="Minimum total" />
              <input className="input num" inputMode="decimal" type="number" placeholder="Max" value={hi} onChange={(e) => setHi(e.target.value)} aria-label="Maximum total" />
            </div>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-ink-800 p-2 pl-3 lg:top-4 print-hide">
          <span className="text-[13px] text-zinc-100">{selected.size} selected</span>
          {selected.size < filtered.length && (
            <button className="text-[13px] text-zinc-400 underline underline-offset-2 hover:text-white" onClick={() => setSelected(new Set(filtered.map((r) => r.rank)))}>
              Select all {filtered.length.toLocaleString()}
            </button>
          )}
          <div className="ml-auto flex gap-1">
            <button className="btn-secondary h-8 px-3 text-[12px]" onClick={() => onExport("xlsx", selectedCombos)}>
              Download Excel
            </button>
            <button className="btn-secondary h-8 px-3 text-[12px]" onClick={() => onExport("csv", selectedCombos)}>
              CSV
            </button>
            <button className="btn-ghost h-8 w-8 px-0" onClick={() => setSelected(new Set())} aria-label="Clear selection">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <DataTable
          caption="Matching products and bundles"
          rows={filtered}
          columns={columns}
          getRowId={(c) => c.rank}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          rowClassName={(c) => (touchesExcluded(c) ? "opacity-40" : "")}
          renderExpanded={(c) => <Details items={c.items.map((id) => byId.get(id))} onPin={onPin} onExclude={onExclude} pinned={pinned} excluded={excluded} />}
          renderCard={(c, { selected: isSel, toggleSelected, expanded, toggleExpanded }) => (
            <div className={`rounded-lg border p-3 ${isSel ? "border-white/30 bg-white/[0.04]" : "border-white/[0.08]"} ${touchesExcluded(c) ? "opacity-40" : ""}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="checkbox mt-1" checked={isSel} onChange={toggleSelected} aria-label={`Select result ${c.rank}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <ProductList items={c.items.map((id) => byId.get(id))} priceField={priceField} pinned={pinned} excluded={excluded} />
                    <span className="money shrink-0 text-[15px] font-medium">{formatMoney(c.total)}</span>
                  </div>
                  <button onClick={toggleExpanded} className="mt-2 text-[12px] text-zinc-400 underline underline-offset-2" aria-expanded={expanded}>
                    {expanded ? "Hide details" : "Details"}
                  </button>
                  {expanded && (
                    <div className="mt-2">
                      <Details items={c.items.map((id) => byId.get(id))} onPin={onPin} onExclude={onExclude} pinned={pinned} excluded={excluded} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          emptyState={
            <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center">
              <p className="text-[14px] text-zinc-300">No results match your search.</p>
              <button className="btn-secondary mt-4" onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          }
        />
      </div>
    </section>
  )
}
