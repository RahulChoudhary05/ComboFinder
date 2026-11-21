// Column role inference: header synonyms + a profile of the column's actual values.

import { parsePrice, parsePercent } from "./price.js"

export const ROLES = [
  { id: "name", label: "Product name", required: true, color: "bg-sky-500" },
  { id: "price", label: "Price", required: true, color: "bg-emerald-500" },
  { id: "sku", label: "Product no. / SKU", color: "bg-amber-500" },
  { id: "category", label: "Category", color: "bg-violet-400" },
  { id: "stock", label: "Stock / In stock", color: "bg-teal-500" },
  { id: "discount", label: "Discount %", color: "bg-rose-500" },
  { id: "description", label: "Description", color: "bg-slate-500" },
]

export const ROLE_IDS = ROLES.map((r) => r.id)

const SYNONYMS = {
  name: ["name", "product name", "productname", "item name", "item", "title", "product title", "product", "article", "model"],
  price: ["price", "product price", "productprice", "unit price", "selling price", "sale price", "mrp", "cost", "amount", "rate", "list price", "retail price", "price inr", "price usd"],
  sku: ["sku", "product no", "productno", "product number", "product id", "productid", "item code", "code", "id", "item no", "article no", "barcode", "ean", "upc", "part number"],
  category: ["category", "categories", "type", "group", "department", "segment", "family", "collection", "product type"],
  stock: ["stock", "in stock", "instock", "quantity", "qty", "inventory", "available", "availability", "units", "on hand"],
  discount: ["discount", "discount %", "discount percent", "off", "% off", "offer", "markdown"],
  description: ["description", "desc", "productdesc", "product description", "details", "summary", "notes", "about"],
}

// Words that, when present, mean a header is NOT this role even if a synonym matches.
const NEGATIVE = {
  name: ["no", "number", "id", "code", "date", "create", "expire", "price", "desc", "description", "category", "supplier", "vendor"],
  price: ["discount", "qty", "quantity", "id", "code", "date"],
  sku: ["name", "price", "date", "desc"],
  stock: ["price", "date"],
  category: [],
  discount: ["price"],
  description: [],
}

export function normaliseHeader(h) {
  return String(h ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // ProductName → Product Name
    .toLowerCase()
    .replace(/[_\-./()[\]#:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function headerScore(role, header) {
  const h = normaliseHeader(header)
  const words = h.split(" ")
  if (NEGATIVE[role].some((n) => words.includes(n)) && !SYNONYMS[role].includes(h)) return 0
  let best = 0
  for (const syn of SYNONYMS[role]) {
    if (h === syn || h.replace(/ /g, "") === syn.replace(/ /g, "")) best = Math.max(best, 1)
    else if (syn.split(" ").every((w) => words.includes(w))) best = Math.max(best, 0.75)
    else if (h.includes(syn) && syn.length >= 3) best = Math.max(best, 0.5)
  }
  return best
}

const YES = /^(y|yes|true|in stock|available|1)$/i
const NO = /^(n|no|false|out of stock|unavailable|sold out|0)$/i

/** Statistical profile of one column (first 1000 rows). */
export function profileColumn(rows, index) {
  const values = []
  for (let i = 0; i < rows.length && values.length < 1000; i++) {
    const v = rows[i][index]
    if (v !== "" && v !== null && v !== undefined) values.push(v)
  }
  const n = values.length
  if (!n) return { filled: 0, numeric: 0, unique: 0, avgLen: 0, boolean: 0, percentLike: 0, integer: 0 }
  let numeric = 0, boolean = 0, percentLike = 0, integer = 0, len = 0
  const uniq = new Set()
  for (const v of values) {
    const s = String(v)
    uniq.add(s.toLowerCase())
    len += s.length
    const p = parsePrice(v)
    if (Number.isFinite(p)) {
      numeric++
      if (Number.isInteger(p)) integer++
    }
    if (YES.test(s.trim()) || NO.test(s.trim())) boolean++
    if (Number.isFinite(parsePercent(v))) percentLike++
  }
  return {
    filled: n / Math.min(rows.length, 1000),
    numeric: numeric / n,
    integer: integer / n,
    unique: uniq.size / n,
    avgLen: len / n,
    boolean: boolean / n,
    percentLike: percentLike / n,
  }
}

function contentScore(role, p) {
  switch (role) {
    case "price":
      return p.numeric >= 0.8 ? 0.5 + 0.3 * p.numeric : -1
    case "name":
      return p.numeric < 0.3 && p.avgLen >= 2 && p.avgLen <= 80 ? 0.2 + 0.3 * p.unique : p.numeric > 0.6 ? -1 : 0
    case "sku":
      return p.unique > 0.9 && p.avgLen <= 24 ? 0.3 : -0.2
    case "category":
      return p.numeric < 0.2 && p.unique < 0.5 ? 0.3 : -0.2
    case "stock":
      return p.boolean > 0.8 || (p.numeric > 0.8 && p.integer > 0.9) ? 0.3 : -0.5
    case "discount":
      return p.percentLike > 0.8 ? 0.25 : -0.5
    case "description":
      return p.avgLen > 20 && p.numeric < 0.1 ? 0.3 : 0
    default:
      return 0
  }
}

/**
 * Infer { role → columnIndex } plus confidence per role. Greedy assignment: highest-scoring
 * (role, column) pairs first, each role and column used at most once.
 */
export function inferMapping(headers, rows) {
  const profiles = headers.map((_, i) => profileColumn(rows, i))
  const candidates = []
  for (const role of ROLE_IDS) {
    headers.forEach((h, i) => {
      const hs = headerScore(role, h)
      const cs = contentScore(role, profiles[i])
      // Header evidence dominates; content can veto (negative) or slightly boost.
      const score = hs > 0 ? hs + cs * 0.5 : role === "price" || role === "name" ? cs * 0.6 : 0
      if (score > 0.25 && cs > -1) candidates.push({ role, index: i, score })
    })
  }
  candidates.sort((a, b) => b.score - a.score)
  const mapping = {}
  const confidence = {}
  const usedCols = new Set()
  for (const c of candidates) {
    if (mapping[c.role] !== undefined || usedCols.has(c.index)) continue
    mapping[c.role] = c.index
    confidence[c.role] = Math.min(1, c.score)
    usedCols.add(c.index)
  }
  return { mapping, confidence, profiles }
}

export function isStockAvailable(v) {
  if (v === "" || v === null || v === undefined) return true // unknown → don't exclude
  const s = String(v).trim()
  if (YES.test(s)) return true
  if (NO.test(s)) return false
  const n = parsePrice(s)
  return Number.isFinite(n) ? n > 0 : true
}
