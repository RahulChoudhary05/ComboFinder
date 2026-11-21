import { useMemo, useState } from "react"
import { AlertTriangle, ChevronDown, Search, PackageSearch } from "lucide-react"
import { formatMoney } from "../lib/price"
import { useDebounced } from "../lib/hooks"
import DataTable from "./ui/DataTable"

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED"]

function Histogram({ histogram, rangeMin, rangeMax }) {
  const { bins, min, width } = histogram
  const [hover, setHover] = useState(null)
  if (!bins.length) return null
  const peak = Math.max(...bins, 1)
  const W = 100 / bins.length
  const inRange = (i) => {
    const lo = min + i * width
    return Number.isFinite(rangeMin) && Number.isFinite(rangeMax) && lo + width > rangeMin && lo <= rangeMax
  }
  return (
    <figure className="relative">
      <div className="flex items-center justify-between">
        <figcaption className="text-[12px] text-zinc-400">Price distribution</figcaption>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-sm bg-accent" /> within your budget
        </span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-2 h-28 w-full overflow-visible" role="img" aria-label="Histogram of product prices" onMouseLeave={() => setHover(null)}>
        {[10, 20, 30].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
        ))}
        {bins.map((c, i) => {
          const h = (c / peak) * 38
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={i * W} y="0" width={W} height="40" fill="transparent" />
              <rect
                x={i * W + 0.35}
                y={40 - h}
                width={W - 0.7}
                height={Math.max(h, c ? 0.8 : 0)}
                rx="0.8"
                fill={inRange(i) ? (hover === i ? "#dbff6b" : "#cdf54b") : hover === i ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.14)"}
              />
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-6 z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-ink-850 px-2 py-1 text-[11px] shadow-xl" style={{ left: `${(hover + 0.5) * W}%` }}>
          <span className="num text-zinc-200">
            {formatMoney(min + hover * width)}–{formatMoney(min + (hover + 1) * width)}
          </span>
          <span className="text-zinc-500"> · {bins[hover]} products</span>
        </div>
      )}
      <div className="num mt-1 flex justify-between text-[11px] text-zinc-500">
        <span>{formatMoney(min)}</span>
        <span>{formatMoney(min + width * bins.length)}</span>
      </div>
    </figure>
  )
}

function Catalogue({ dataset, rangeMin, rangeMax, priceField }) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("")
  const [onlyRange, setOnlyRange] = useState(false)
  const dq = useDebounced(q, 200)
  const rows = useMemo(() => {
    const terms = dq.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return dataset.products.filter((p) => {
      if (cat && p.category !== cat) return false
      if (onlyRange && (p[priceField] < rangeMin || p[priceField] > rangeMax)) return false
      if (terms.length) {
        const hay = `${p.name} ${p.sku} ${p.category} ${p.description}`.toLowerCase()
        if (!terms.every((t) => hay.includes(t))) return false
      }
      return true
    })
  }, [dataset, dq, cat, onlyRange, rangeMin, rangeMax, priceField])

  const inRange = (p) => Number.isFinite(rangeMin) && p[priceField] >= rangeMin && p[priceField] <= rangeMax
  const columns = [
    { id: "sku", header: "SKU", cell: (p) => <span className="num text-[12px] text-zinc-500">{p.sku || "—"}</span>, sortValue: (p) => p.sku, hideBelow: "sm" },
    {
      id: "name",
      header: "Product",
      cell: (p) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-zinc-100">{p.name}</p>
          {p.description && <p className="line-clamp-1 text-[12px] text-zinc-500">{p.description}</p>}
        </div>
      ),
      sortValue: (p) => p.name,
    },
    { id: "cat", header: "Category", cell: (p) => (p.category ? <span className="chip">{p.category}</span> : <span className="text-zinc-600">—</span>), sortValue: (p) => p.category, hideBelow: "md" },
    { id: "stock", header: "Stock", cell: (p) => <span className={p.inStock ? "text-zinc-300" : "text-zinc-600"}>{p.inStock ? "In stock" : "Sold out"}</span>, sortValue: (p) => (p.inStock ? 1 : 0), hideBelow: "lg" },
    {
      id: "price",
      header: "Price",
      align: "right",
      sortValue: (p) => p[priceField],
      cell: (p) => (
        <span className={`num whitespace-nowrap font-medium ${inRange(p) ? "text-accent" : "text-zinc-200"}`}>
          {formatMoney(p[priceField])}
          {p.discountPct > 0 && <span className="block text-[11px] font-normal text-coral">{p.discountPct}% off</span>}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-9" placeholder="Search the catalogue" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search catalogue" />
        </div>
        {dataset.report.categories.length > 0 && (
          <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {dataset.report.categories.map(([c]) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 text-[12px] text-zinc-300">
          <input type="checkbox" role="switch" className="switch" checked={onlyRange} onChange={(e) => setOnlyRange(e.target.checked)} disabled={!Number.isFinite(rangeMin)} />
          Only in budget
        </label>
      </div>
      <DataTable
        caption="Product catalogue"
        rows={rows}
        columns={columns}
        getRowId={(p) => p.id}
        initialSort={{ id: "price", dir: "asc" }}
        pageSizes={[10, 25, 50, 100]}
        renderCard={(p) => (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-100">{p.name}</p>
              <p className="truncate text-[12px] text-zinc-500">{[p.sku && `#${p.sku}`, p.category, p.inStock ? "In stock" : "Out of stock"].filter(Boolean).join(" · ")}</p>
            </div>
            <span className={`num shrink-0 font-medium ${inRange(p) ? "text-accent" : "text-zinc-200"}`}>{formatMoney(p[priceField])}</span>
          </div>
        )}
        emptyState={
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-12 text-center text-[13px] text-zinc-400">
            <PackageSearch className="mb-2 h-7 w-7 text-zinc-600" />
            No products match.
          </div>
        }
      />
    </div>
  )
}

export default function DataInsights({ dataset, currency, onCurrencyChange, rangeMin, rangeMax, priceField }) {
  const [tab, setTab] = useState("overview")
  const [showIssues, setShowIssues] = useState(false)
  const { report } = dataset
  const { stats, issues } = report
  const tiles = [
    { label: "Products", value: report.valid.toLocaleString(), sub: report.skipped ? `${report.skipped} rows skipped` : "All rows valid" },
    { label: "Median price", value: formatMoney(stats.median), sub: `IQR ${formatMoney(stats.p25)}–${formatMoney(stats.p75)}` },
    { label: "Cheapest → priciest", value: `${formatMoney(stats.min)} → ${formatMoney(stats.max)}`, sub: `Mean ${formatMoney(stats.mean)}` },
    dataset.hasStock
      ? { label: "In stock", value: report.inStock.toLocaleString(), sub: `${report.valid - report.inStock} sold out` }
      : { label: "Categories", value: report.categories.length || "—", sub: dataset.hasCategory ? "Distinct" : "No category column" },
  ]
  const issueList = [
    ["unreadable price", issues.invalidPrice],
    ["missing name", issues.missingName],
    ["negative price", issues.negativePrice],
    ["duplicate", issues.duplicates],
  ].filter(([, n]) => n)

  return (
    <section id="insights" className="card scroll-mt-20" aria-labelledby="insights-title">
      <div className="card-head">
        <div>
          <h2 id="insights-title" className="card-title">
            Your catalogue
          </h2>
          <p className="card-sub">A quick look at what’s in the file.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="segmented" role="tablist" aria-label="Insights view">
            <button role="tab" aria-selected={tab === "overview"} aria-pressed={tab === "overview"} onClick={() => setTab("overview")}>
              Overview
            </button>
            <button role="tab" aria-selected={tab === "catalogue"} aria-pressed={tab === "catalogue"} onClick={() => setTab("catalogue")}>
              Catalogue <span className="num ml-1 text-zinc-500">{report.valid}</span>
            </button>
          </div>
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="input h-9 w-[88px] text-[12px]" aria-label="Currency">
            {[...new Set([currency, ...CURRENCIES])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {tab === "overview" ? (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="border-l border-white/10 pl-4">
                <dt className="text-[12px] text-zinc-500">{t.label}</dt>
                <dd className="num mt-1 truncate text-[20px] font-medium tracking-tight text-zinc-50" title={String(t.value)}>
                  {t.value}
                </dd>
                <dd className="truncate text-[12px] text-zinc-500">{t.sub}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <Histogram histogram={report.histogram} rangeMin={rangeMin} rangeMax={rangeMax} />
          </div>

          {report.categories.length > 0 && (
            <p className="mt-5 text-[13px] leading-relaxed text-zinc-500">
              <span className="text-zinc-400">Categories:</span>{" "}
              {report.categories.slice(0, 14).map(([c, n]) => `${c} (${n})`).join(" · ")}
              {report.categories.length > 14 && ` · +${report.categories.length - 14} more`}
            </p>
          )}

          {issueList.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] text-[13px]">
              <button onClick={() => setShowIssues(!showIssues)} className="flex w-full items-center gap-2 p-3 text-left text-amber-200" aria-expanded={showIssues}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{issueList.map(([l, n]) => `${n} ${l}${n > 1 ? "s" : ""}`).join(" · ")} skipped</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showIssues ? "rotate-180" : ""}`} />
              </button>
              {showIssues && (
                <ul className="max-h-40 space-y-1 overflow-y-auto px-3 pb-3 text-[12px] text-amber-100/80">
                  {report.issueRows.map((r, i) => (
                    <li key={i}>
                      <span className="num text-amber-300">Row {r.rowNumber}</span> · {r.reason}
                      {r.name && <span className="text-amber-100/50"> ({r.name})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        <Catalogue dataset={dataset} rangeMin={rangeMin} rangeMax={rangeMax} priceField={priceField} />
      )}
    </section>
  )
}
