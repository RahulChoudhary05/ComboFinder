// Turn a parsed sheet + column mapping into clean product records and a data-quality report.

import { parsePrice, parsePercent, toCents, detectCurrency } from "./price.js"
import { isStockAvailable, ROLE_IDS } from "./columns.js"

export function buildDataset(sheet, mapping, { dedupe = true } = {}) {
  const { headers, rows } = sheet
  const col = (role) => (mapping[role] === undefined || mapping[role] === null ? -1 : mapping[role])
  const nameI = col("name"), priceI = col("price"), skuI = col("sku"), catI = col("category")
  const stockI = col("stock"), discI = col("discount"), descI = col("description")
  if (nameI < 0 || priceI < 0) throw new Error("Map at least a product name column and a price column.")

  const roleCols = new Set(ROLE_IDS.map(col).filter((i) => i >= 0))
  const extraCols = headers.map((h, i) => i).filter((i) => !roleCols.has(i))

  const products = []
  const issues = { missingName: 0, invalidPrice: 0, negativePrice: 0, duplicates: 0 }
  const issueRows = []
  const seen = new Set()

  rows.forEach((row, r) => {
    const rowNumber = r + (sheet.headerRow ?? 0) + 2 // 1-based, after the header row
    const name = String(row[nameI] ?? "").trim()
    const price = parsePrice(row[priceI])
    if (!name) {
      issues.missingName++
      if (issueRows.length < 50) issueRows.push({ rowNumber, reason: "Missing product name" })
      return
    }
    if (!Number.isFinite(price)) {
      issues.invalidPrice++
      if (issueRows.length < 50) issueRows.push({ rowNumber, reason: `Unreadable price "${row[priceI]}"`, name })
      return
    }
    if (price < 0) {
      issues.negativePrice++
      if (issueRows.length < 50) issueRows.push({ rowNumber, reason: "Negative price", name })
      return
    }
    const sku = skuI >= 0 ? String(row[skuI] ?? "").trim() : ""
    const priceCents = toCents(price)
    const key = sku ? `sku:${sku.toLowerCase()}` : `np:${name.toLowerCase()}|${priceCents}`
    if (dedupe && seen.has(key)) {
      issues.duplicates++
      if (issueRows.length < 50) issueRows.push({ rowNumber, reason: sku ? `Duplicate SKU ${sku}` : "Duplicate name + price", name })
      return
    }
    seen.add(key)

    const discountPct = discI >= 0 ? parsePercent(row[discI]) : NaN
    const finalCents = Number.isFinite(discountPct) && discountPct > 0 ? toCents((priceCents * (1 - discountPct / 100)) / 100) : priceCents
    const extra = {}
    for (const i of extraCols) if (row[i] !== "") extra[headers[i]] = row[i]

    products.push({
      id: products.length,
      rowNumber,
      name,
      sku,
      category: catI >= 0 ? String(row[catI] ?? "").trim() : "",
      inStock: stockI >= 0 ? isStockAvailable(row[stockI]) : true,
      stock: stockI >= 0 ? row[stockI] : "",
      discountPct: Number.isFinite(discountPct) ? discountPct : 0,
      priceCents,
      finalCents,
      description: descI >= 0 ? String(row[descI] ?? "") : "",
      extra,
    })
  })

  return {
    products,
    report: buildReport(products, rows.length, issues, issueRows),
    currency: detectCurrency(rows.slice(0, 200).map((r) => r[priceI])),
    extraHeaders: extraCols.map((i) => headers[i]),
    hasCategory: catI >= 0,
    hasStock: stockI >= 0,
    hasDiscount: discI >= 0,
  }
}

export function quantile(sorted, q) {
  if (!sorted.length) return 0
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos), hi = Math.ceil(pos)
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo))
}

export function histogram(values, bins = 24) {
  if (!values.length) return { bins: [], min: 0, max: 0, width: 0 }
  let min = Infinity, max = -Infinity
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const width = Math.max(1, Math.ceil((max - min + 1) / bins))
  const counts = new Array(bins).fill(0)
  for (const v of values) counts[Math.min(bins - 1, Math.floor((v - min) / width))]++
  return { bins: counts, min, max, width }
}

function buildReport(products, totalRows, issues, issueRows) {
  const prices = products.map((p) => p.priceCents).sort((a, b) => a - b)
  const categories = new Map()
  for (const p of products) if (p.category) categories.set(p.category, (categories.get(p.category) || 0) + 1)
  const sum = prices.reduce((a, b) => a + b, 0)
  return {
    totalRows,
    valid: products.length,
    skipped: totalRows - products.length,
    issues,
    issueRows,
    inStock: products.filter((p) => p.inStock).length,
    categories: [...categories.entries()].sort((a, b) => b[1] - a[1]),
    stats: {
      min: prices[0] ?? 0,
      max: prices.at(-1) ?? 0,
      mean: prices.length ? Math.round(sum / prices.length) : 0,
      median: quantile(prices, 0.5),
      p25: quantile(prices, 0.25),
      p75: quantile(prices, 0.75),
    },
    histogram: histogram(prices),
  }
}
