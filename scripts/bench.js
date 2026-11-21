// Benchmark: v1 brute force vs v2 engine. Run with `npm run bench`.
import { findCombos } from "../src/lib/comboEngine.js"

function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

function catalogue(n, seed = 7) {
  const r = rng(seed)
  // Log-normal-ish prices between ~5 and ~2000 (in cents)
  return Array.from({ length: n }, (_, i) => {
    const price = Math.round(Math.exp(1.6 + r() * 6) * 100)
    return { id: i, name: `P${i}`, priceCents: price, finalCents: price, category: `C${i % 12}`, inStock: true }
  })
}

// v1: O(n²) pairs + O(n³) triples, materialising every match.
function v1(products, min, max) {
  let count = 0
  const n = products.length
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const t = products[i].priceCents + products[j].priceCents
      if (t >= min && t <= max) count++
    }
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const t = products[i].priceCents + products[j].priceCents + products[k].priceCents
        if (t >= min && t <= max) count++
      }
  return count
}

const time = (fn) => {
  const t = performance.now()
  const r = fn()
  return [r, performance.now() - t]
}

const cases = [
  { n: 100, min: 49000, max: 51000 },
  { n: 500, min: 49000, max: 51000 },
  { n: 1000, min: 49000, max: 51000 },
  { n: 5000, min: 49000, max: 51000, skipV1: true },
  { n: 20000, min: 49000, max: 51000, skipV1: true },
]

console.log("products | v1 brute force (pairs+triples) | v2 engine (pairs+triples, top 5000) | matches")
for (const c of cases) {
  const ps = catalogue(c.n)
  const [v1count, v1ms] = c.skipV1 ? [null, null] : time(() => v1(ps, c.min, c.max))
  const [res, v2ms] = time(() => findCombos(ps, { min: c.min, max: c.max, minItems: 2, maxItems: 3, limit: 5000, budget: 2e8 }))
  if (v1count !== null && v1count !== res.matches) throw new Error(`Mismatch at n=${c.n}: ${v1count} vs ${res.matches}`)
  console.log(
    `${String(c.n).padStart(8)} | ${v1ms === null ? "      (skipped: too slow)" : (v1ms.toFixed(1) + " ms").padStart(25)} | ${(v2ms.toFixed(1) + " ms").padStart(20)}${res.complete ? "" : " (budget hit)"} | ${res.matches.toLocaleString()}`,
  )
}
