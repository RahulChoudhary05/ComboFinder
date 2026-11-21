// ComboFinder search engine.
//
// Problem: given n prices (integer cents), list subsets of size kMin..kMax whose sum lies in [L, U].
// Approach (see docs/RND.md §3.4):
//   * sort ascending + prefix sums,
//   * k = 1 and the last level of every search use two binary searches (window [L-s, U-s]),
//   * k ≥ 2 uses depth-first branch-and-bound with O(1) lower/upper completion bounds,
//   * answers stream into a bounded max-heap so memory is O(limit) no matter how many matches exist,
//   * a node budget stops pathological searches and reports that the result is partial.
// The function is pure and synchronous; the UI runs it in a Web Worker (comboWorker.js).

export const SORTS = {
  closest: "Closest to target",
  cheapest: "Lowest total",
  priciest: "Highest total",
  fewest: "Fewest items",
  saving: "Biggest discount saving",
}

const DEFAULTS = {
  minItems: 1,
  maxItems: 3,
  priceField: "priceCents",
  inStockOnly: false,
  distinctCategory: false,
  mustInclude: [],
  exclude: [],
  sortBy: "closest",
  target: null,
  limit: 5000,
  budget: 25_000_000,
}

export const MAX_ITEMS_CAP = 6

// ------------------------------------------------------------------ bounded heap (keeps the `limit` best)

class TopK {
  constructor(limit) {
    this.limit = limit
    this.h = [] // max-heap on score: h[0] is the WORST kept entry
  }
  get full() {
    return this.h.length >= this.limit
  }
  worst() {
    return this.h.length ? this.h[0].score : Infinity
  }
  accepts(score) {
    return !this.full || score < this.h[0].score
  }
  push(entry) {
    const h = this.h
    if (h.length < this.limit) {
      h.push(entry)
      let i = h.length - 1
      while (i > 0) {
        const p = (i - 1) >> 1
        if (h[p].score >= h[i].score) break
        ;[h[p], h[i]] = [h[i], h[p]]
        i = p
      }
    } else if (entry.score < h[0].score) {
      h[0] = entry
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let m = i
        if (l < h.length && h[l].score > h[m].score) m = l
        if (r < h.length && h[r].score > h[m].score) m = r
        if (m === i) break
        ;[h[m], h[i]] = [h[i], h[m]]
        i = m
      }
    }
  }
  sorted() {
    return [...this.h].sort((a, b) => a.score - b.score || a.total - b.total)
  }
}

// ------------------------------------------------------------------ helpers

/** first index in [lo, hi) with a[i] >= x */
export function lowerBound(a, x, lo = 0, hi = a.length) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (a[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** first index in [lo, hi) with a[i] > x */
export function upperBound(a, x, lo = 0, hi = a.length) {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (a[mid] <= x) lo = mid + 1
    else hi = mid
  }
  return lo
}

class BudgetExceeded extends Error {}

// ------------------------------------------------------------------ main entry

/**
 * @param {Array} products  records from buildDataset (need id, priceCents, finalCents, category, inStock)
 * @param {object} options  { min, max } in cents, plus DEFAULTS above
 * @param {(p:{progress:number, matches:number, visited:number})=>void} [onProgress]
 */
export function findCombos(products, options, onProgress) {
  const t0 = now()
  const o = { ...DEFAULTS, ...options }
  const min = Math.round(o.min), max = Math.round(o.max)
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error("Enter a valid price range.")
  if (min > max) throw new Error("The minimum price must not be greater than the maximum.")
  const minItems = clamp(o.minItems | 0, 1, MAX_ITEMS_CAP)
  const maxItems = clamp(o.maxItems | 0, minItems, MAX_ITEMS_CAP)
  const target = Number.isFinite(o.target) && o.target !== null ? Math.round(o.target) : Math.round((min + max) / 2)
  const field = o.priceField === "finalCents" ? "finalCents" : "priceCents"

  const byId = new Map(products.map((p) => [p.id, p]))
  const excluded = new Set(o.exclude)
  const forced = [...new Set(o.mustInclude)].map((id) => byId.get(id)).filter(Boolean)

  // Category codes: products without a category are never in conflict.
  const catCode = new Map()
  const codeOf = (c) => {
    if (!c) return -1
    const k = c.toLowerCase()
    if (!catCode.has(k)) catCode.set(k, catCode.size)
    return catCode.get(k)
  }

  const result = (combos, extra) => ({
    combos,
    matches: 0,
    complete: true,
    visited: 0,
    bySize: {},
    elapsedMs: Math.round(now() - t0),
    poolSize: 0,
    target,
    ...extra,
  })

  // Forced items: fixed partial sum and categories.
  const forcedCats = new Set()
  let forcedSum = 0
  let forcedSaving = 0
  for (const p of forced) {
    const c = codeOf(p.category)
    if (o.distinctCategory && c >= 0) {
      if (forcedCats.has(c)) return result([], { note: "Two must-include products share a category." })
      forcedCats.add(c)
    }
    forcedSum += p[field]
    forcedSaving += p.priceCents - p.finalCents
  }
  const f = forced.length
  if (f > maxItems) return result([], { note: "More must-include products than the maximum bundle size." })

  const pool = products
    .filter((p) => !excluded.has(p.id) && !forced.some((q) => q.id === p.id))
    .filter((p) => !o.inStockOnly || p.inStock)
    .filter((p) => !o.distinctCategory || !forcedCats.has(codeOf(p.category)))
    .sort((a, b) => a[field] - b[field])

  const n = pool.length
  const price = Int32Array.from(pool, (p) => p[field])
  const saving = Int32Array.from(pool, (p) => p.priceCents - p.finalCents)
  const cat = Int32Array.from(pool, (p) => codeOf(p.category))
  const P = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) P[i + 1] = P[i] + price[i]

  const heap = new TopK(Math.max(1, o.limit | 0))
  const bySize = {}
  let matches = 0
  let visited = 0
  let complete = true
  let lastTick = now()
  let progressBase = 0
  let progressSpan = 1

  const scoreOf = (total, size, sav) => {
    switch (o.sortBy) {
      case "cheapest":
        return total * 8 + size
      case "priciest":
        return -total * 8 + size
      case "fewest":
        return size * 1e12 + Math.abs(total - target)
      case "saving":
        return -sav * 1e6 + Math.abs(total - target) / 1e9
      default:
        return Math.abs(total - target) * 8 + size
    }
  }

  const stack = []
  const usedCat = new Set(forcedCats)
  const forcedIds = forced.map((p) => p.id)

  const emit = (j, s, sav, size) => {
    const total = forcedSum + s + price[j]
    const score = scoreOf(total, size, forcedSaving + sav + saving[j])
    if (heap.accepts(score)) {
      const items = forcedIds.concat(stack.map((k) => pool[k].id), pool[j].id)
      heap.push({ score, total, items, saving: forcedSaving + sav + saving[j] })
    }
  }

  const tick = (i, topLevel) => {
    if (++visited > o.budget) throw new BudgetExceeded()
    if ((visited & 0x3fff) === 0 && onProgress) {
      const t = now()
      if (t - lastTick > 100) {
        lastTick = t
        onProgress({ progress: progressBase + progressSpan * (topLevel / Math.max(1, n)), matches, visited })
      }
    }
  }

  // Last level: every j in the window [lo, hi) is a match (modulo the category rule).
  const lastLevel = (start, s, sav, size, lo0, hi0) => {
    const lo = lowerBound(price, lo0 - s, start)
    const hi = upperBound(price, hi0 - s, lo)
    if (lo >= hi) return 0
    if (o.distinctCategory) {
      let found = 0
      for (let j = lo; j < hi; j++) {
        tick(j, start)
        if (cat[j] >= 0 && usedCat.has(cat[j])) continue
        found++
        emit(j, s, sav, size)
      }
      return found
    }
    const count = hi - lo
    // Without the category rule every j matches, so we can count exactly and only feed the heap the
    // candidates that could still beat its current worst entry (scores are monotone in |window position|).
    const base = forcedSum + s
    const sc = (j) => scoreOf(base + price[j], size, forcedSaving + sav + saving[j])
    if (o.sortBy === "cheapest") {
      for (let j = lo; j < hi && heap.accepts(sc(j)); j++) tick(j, start), emit(j, s, sav, size)
    } else if (o.sortBy === "priciest") {
      for (let j = hi - 1; j >= lo && heap.accepts(sc(j)); j--) tick(j, start), emit(j, s, sav, size)
    } else if (o.sortBy === "closest" || o.sortBy === "fewest") {
      const mid = lowerBound(price, target - base, lo, hi)
      let a = mid - 1, b = mid
      while (a >= lo || b < hi) {
        const sa = a >= lo ? sc(a) : Infinity
        const sb = b < hi ? sc(b) : Infinity
        const takeA = sa <= sb
        const j = takeA ? a : b
        if (!heap.accepts(takeA ? sa : sb)) break
        tick(j, start)
        emit(j, s, sav, size)
        if (takeA) a--
        else b++
      }
    } else {
      for (let j = lo; j < hi; j++) tick(j, start), emit(j, s, sav, size)
    }
    return count
  }

  const dfs = (start, r, s, sav, size, L, U) => {
    if (r === 1) return lastLevel(start, s, sav, size, L, U)
    let found = 0
    const topOfRest = P[n] - P[n - (r - 1)] // the r-1 most expensive prices
    for (let i = start; i <= n - r; i++) {
      tick(i, stack.length === 0 ? i : start)
      if (s + (P[i + r] - P[i]) > U) break // cheapest completion from i is already too expensive
      if (s + price[i] + topOfRest < L) continue // even the most expensive completion is too cheap
      const c = cat[i]
      if (o.distinctCategory && c >= 0) {
        if (usedCat.has(c)) continue
        usedCat.add(c)
      }
      stack.push(i)
      found += dfs(i + 1, r - 1, s + price[i], sav + saving[i], size, L, U)
      stack.pop()
      if (o.distinctCategory && c >= 0) usedCat.delete(c)
    }
    return found
  }

  const sizes = []
  for (let k = Math.max(minItems, f); k <= maxItems; k++) sizes.push(k)

  try {
    sizes.forEach((k, idx) => {
      progressBase = idx / sizes.length
      progressSpan = 1 / sizes.length
      const m = k - f
      let found = 0
      if (m === 0) {
        if (forcedSum >= min && forcedSum <= max) {
          found = 1
          const score = scoreOf(forcedSum, k, forcedSaving)
          if (heap.accepts(score)) heap.push({ score, total: forcedSum, items: forcedIds.slice(), saving: forcedSaving })
        }
      } else if (m <= n) {
        const L = min - forcedSum, U = max - forcedSum
        // Whole-size bounds: skip sizes that cannot possibly fit.
        if (P[m] <= U && P[n] - P[n - m] >= L) found = dfs(0, m, 0, 0, k, L, U)
      }
      if (found) bySize[k] = found
      matches += found
    })
  } catch (e) {
    if (!(e instanceof BudgetExceeded)) throw e
    complete = false
  }

  onProgress?.({ progress: 1, matches, visited })
  return {
    combos: heap.sorted().map(({ total, items, saving: sv }) => ({ items, total, saving: sv })),
    matches,
    complete,
    visited,
    bySize,
    elapsedMs: Math.round(now() - t0),
    poolSize: n,
    target,
  }
}

// ------------------------------------------------------------------ reference implementation (tests/bench)

/** Exhaustive search used to verify the engine. Exponential — only for small inputs. */
export function bruteForceCount(prices, min, max, minItems, maxItems) {
  const n = prices.length
  let count = 0
  const rec = (start, k, s, depth) => {
    if (depth >= minItems && depth <= maxItems && depth > 0 && s >= min && s <= max) count++
    if (depth === maxItems) return
    for (let i = start; i < n; i++) rec(i + 1, k, s + prices[i], depth + 1)
  }
  rec(0, maxItems, 0, 0)
  return count
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now()
}
