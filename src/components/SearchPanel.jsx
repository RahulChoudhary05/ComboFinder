import { useMemo, useState } from "react"
import { Loader2, X, ChevronDown } from "lucide-react"
import { SORTS, MAX_ITEMS_CAP, lowerBound, upperBound } from "../lib/comboEngine"
import { formatMoney, fromCents, toCents } from "../lib/price"

export const SIZE_PRESETS = [
  { label: "Single", min: 1, max: 1 },
  { label: "Pairs", min: 2, max: 2 },
  { label: "Up to 3", min: 1, max: 3 },
  { label: "2–4", min: 2, max: 4 },
]
const TOLERANCES = [2, 5, 10]

function Rule({ checked, onChange, title, hint, disabled, id }) {
  return (
    <label htmlFor={id} className={`flex items-center justify-between gap-4 py-2.5 ${disabled ? "opacity-40" : "cursor-pointer"}`}>
      <span>
        <span className="block text-[13px] text-zinc-200">{title}</span>
        <span className="block text-[12px] text-zinc-500">{hint}</span>
      </span>
      <input id={id} type="checkbox" role="switch" className="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

/** Live checks against the catalogue; each problem comes with a one-click fix. */
function useValidation(params, sortedPrices) {
  return useMemo(() => {
    const out = { errors: [], hint: null }
    const { min, max, minItems, maxItems } = params
    if (min === "" || max === "") return (out.errors.push({ text: "Enter a minimum and a maximum." }), out)
    const lo = Number(min), hi = Number(max)
    if (lo < 0 || hi < 0) out.errors.push({ text: "Prices can’t be negative." })
    if (lo > hi) out.errors.push({ text: "The minimum is higher than the maximum.", fix: { label: "Swap them", patch: { min: max, max: min } } })
    if (!sortedPrices?.length || out.errors.length) return out

    const n = sortedPrices.length
    const loC = toCents(lo), hiC = toCents(hi)
    let cheapest = 0, priciest = 0
    for (let i = 0; i < Math.min(minItems, n); i++) cheapest += sortedPrices[i]
    for (let i = 0; i < Math.min(maxItems, n); i++) priciest += sortedPrices[n - 1 - i]

    if (minItems > n) out.errors.push({ text: `There are only ${n} products in this file.`, fix: { label: "Use up to 3", patch: { minItems: 1, maxItems: Math.min(n, 3) } } })
    else if (hiC < cheapest)
      out.errors.push({ text: `Nothing costs that little. The cheapest ${minItems === 1 ? "product" : `${minItems}-item bundle`} is ${formatMoney(cheapest)}.`, fix: { label: `Set max to ${formatMoney(cheapest)}`, patch: { max: String(fromCents(cheapest)) } } })
    else if (loC > priciest)
      out.errors.push({ text: `Nothing costs that much. The most expensive ${maxItems === 1 ? "product" : `${maxItems}-item bundle`} is ${formatMoney(priciest)}.`, fix: { label: `Set min to ${formatMoney(priciest)}`, patch: { min: String(fromCents(priciest)) } } })
    else if (minItems === 1) {
      const count = upperBound(sortedPrices, hiC) - lowerBound(sortedPrices, loC)
      out.hint = `${count} product${count === 1 ? "" : "s"} in this range on ${count === 1 ? "its" : "their"} own${maxItems > 1 ? ", plus bundles" : ""}.`
    }
    return out
  }, [params, sortedPrices])
}

export default function SearchPanel({ params, setParams, dataset, currency, byId, sortedPrices, onSearch, onCancel, running, progress, liveMatches, disabled }) {
  const [more, setMore] = useState(false)
  const set = (patch) => setParams((p) => ({ ...p, ...patch }))
  const { errors, hint } = useValidation(params, sortedPrices)
  const preset = SIZE_PRESETS.find((p) => p.min === params.minItems && p.max === params.maxItems)
  const rulesOn = (params.priceField === "finalCents") + params.inStockOnly + params.distinctCategory

  const applyTolerance = (pct) => {
    const t = Number(params.target)
    if (!Number.isFinite(t) || t <= 0) return
    set({ min: String(+(t * (1 - pct / 100)).toFixed(2)), max: String(+(t * (1 + pct / 100)).toFixed(2)) })
  }

  return (
    <section id="budget" tabIndex={-1} className="card scroll-mt-20 outline-none" aria-labelledby="budget-title">
      <div className="card-head">
        <div>
          <h2 id="budget-title" className="card-title">
            Budget
          </h2>
          <p className="card-sub">What should the total cost?</p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!errors.length) onSearch()
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            ["min", "From"],
            ["max", "To"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="label" htmlFor={`r-${k}`}>
                {label}
              </label>
              <div className="relative">
                <input
                  id={`r-${k}`}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  className={`input num h-11 pr-12 text-[16px] ${errors.length && disabled === false ? "input-error" : ""}`}
                  value={params[k]}
                  onChange={(e) => set({ [k]: e.target.value })}
                  aria-describedby="range-msg"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-600">{currency}</span>
              </div>
            </div>
          ))}
        </div>

        <div id="range-msg" aria-live="polite" className="mt-2 min-h-[20px] text-[13px]">
          {errors.map((e) => (
            <p key={e.text} className="text-red-300">
              {e.text}{" "}
              {e.fix && (
                <button type="button" className="font-medium text-zinc-100 underline underline-offset-2" onClick={() => set(e.fix.patch)}>
                  {e.fix.label}
                </button>
              )}
            </p>
          ))}
          {!errors.length && hint && <p className="text-zinc-500">{hint}</p>}
        </div>

        <div className="mt-4">
          <span className="label">Items per result</span>
          <div className="segmented w-full sm:w-auto" role="group" aria-label="Items per result">
            {SIZE_PRESETS.map((p) => (
              <button type="button" key={p.label} className="flex-1 sm:flex-none" aria-pressed={preset === p} onClick={() => set({ minItems: p.min, maxItems: p.max })}>
                {p.label}
              </button>
            ))}
          </div>
          {!preset && (
            <p className="mt-1.5 text-[12px] text-zinc-500">
              Custom: {params.minItems}–{params.maxItems} items
            </p>
          )}
        </div>

        {(params.mustInclude.length > 0 || params.exclude.length > 0) && (
          <div className="mt-4 space-y-1.5 text-[13px]">
            {[
              ["mustInclude", "Always included"],
              ["exclude", "Excluded"],
            ].map(
              ([key, label]) =>
                params[key].length > 0 && (
                  <div key={key} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-zinc-500">{label}:</span>
                    {params[key].map((id) => (
                      <button type="button" key={id} className="chip text-zinc-300 hover:border-white/25" onClick={() => set({ [key]: params[key].filter((x) => x !== id) })} aria-label={`Remove ${byId.get(id)?.name}`}>
                        {byId.get(id)?.name} <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                ),
            )}
          </div>
        )}

        {/* Advanced options stay out of the way until needed */}
        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="mt-5 flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-100">
          <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} />
          More options
          {rulesOn > 0 && <span className="text-zinc-500">· {rulesOn} rule{rulesOn > 1 ? "s" : ""} on</span>}
        </button>

        {more && (
          <div className="mt-3 space-y-5 border-t border-white/[0.08] pt-4">
            <div>
              <label className="label" htmlFor="r-target">
                Aim for a price
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input id="r-target" type="number" inputMode="decimal" step="any" min="0" placeholder="e.g. 500" className="input num w-32" value={params.target} onChange={(e) => set({ target: e.target.value })} />
                {TOLERANCES.map((t) => (
                  <button type="button" key={t} onClick={() => applyTolerance(t)} className="chip-btn" disabled={!params.target}>
                    ±{t}%
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-zinc-500">Sets the range around your target. Results closest to it come first.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="r-from">
                  Fewest items
                </label>
                <select id="r-from" className="input" value={params.minItems} onChange={(e) => set({ minItems: +e.target.value, maxItems: Math.max(+e.target.value, params.maxItems) })}>
                  {Array.from({ length: MAX_ITEMS_CAP }, (_, i) => i + 1).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="r-to">
                  Most items
                </label>
                <select id="r-to" className="input" value={params.maxItems} onChange={(e) => set({ maxItems: +e.target.value, minItems: Math.min(+e.target.value, params.minItems) })}>
                  {Array.from({ length: MAX_ITEMS_CAP }, (_, i) => i + 1).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="r-sort">
                  Sort results by
                </label>
                <select id="r-sort" className="input" value={params.sortBy} onChange={(e) => set({ sortBy: e.target.value })}>
                  {Object.entries(SORTS)
                    .filter(([k]) => k !== "saving" || dataset?.hasDiscount)
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="r-limit">
                  Show up to
                </label>
                <select id="r-limit" className="input" value={params.limit} onChange={(e) => set({ limit: +e.target.value })}>
                  {[500, 1000, 5000, 20000, 50000].map((n) => (
                    <option key={n} value={n}>
                      {n.toLocaleString()} results
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-white/[0.06]">
              <Rule id="rule-disc" checked={params.priceField === "finalCents"} onChange={(v) => set({ priceField: v ? "finalCents" : "priceCents" })} title="Use discounted prices" hint={dataset?.hasDiscount ? "Apply each product’s discount first" : "Your file has no discount column"} disabled={!dataset?.hasDiscount} />
              <Rule id="rule-stock" checked={params.inStockOnly} onChange={(v) => set({ inStockOnly: v })} title="Only in-stock products" hint={dataset?.hasStock ? "Leave out sold-out items" : "Your file has no stock column"} disabled={!dataset?.hasStock} />
              <Rule id="rule-cat" checked={params.distinctCategory} onChange={(v) => set({ distinctCategory: v })} title="One product per category" hint={dataset?.hasCategory ? "No two items from the same category" : "Your file has no category column"} disabled={!dataset?.hasCategory} />
            </div>
          </div>
        )}

        <div className="mt-6">
          {running ? (
            <div role="status">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${Math.max(4, progress * 100)}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching… {liveMatches.toLocaleString()} found
                </span>
                <button type="button" onClick={onCancel} className="btn-secondary h-9">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="submit" className="btn-primary h-11 w-full text-[14px]" disabled={disabled || errors.length > 0}>
              {disabled ? "Add a product file first" : "Find matches"}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
