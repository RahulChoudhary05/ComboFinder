// Locale-tolerant price parsing. All money in ComboFinder is held as integer
// minor units (cents / paise) so sums are exact — 0.1 + 0.2 must equal 0.3.

const CURRENCY = /[$€£¥₹₩₽₺₫฿₱₦₴₪]|\b(?:usd|eur|gbp|inr|jpy|cny|aud|cad|sgd|aed|chf)\b|\brs\.?/gi

/**
 * Parse a human-written price into a JS number, or NaN.
 * Handles "$1,200.50", "₹ 1,20,000", "1.234,56 €", "(12.50)", "12,5", "1 299", "-3".
 */
export function parsePrice(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : NaN
  if (input === null || input === undefined) return NaN
  let s = String(input).trim()
  if (!s) return NaN

  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }
  s = s.replace(CURRENCY, "").replace(/[\s  ']/g, "")
  if (s.startsWith("-")) {
    negative = !negative
    s = s.slice(1)
  } else if (s.endsWith("-")) {
    negative = !negative
    s = s.slice(0, -1)
  }
  if (s.startsWith("+")) s = s.slice(1)
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN

  const lastComma = s.lastIndexOf(",")
  const lastDot = s.lastIndexOf(".")

  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: the right-most one is the decimal separator.
    const dec = lastComma > lastDot ? "," : "."
    const thou = dec === "," ? "." : ","
    s = s.split(thou).join("").replace(dec, ".")
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? "," : "."
    const parts = s.split(sep)
    if (parts.length === 2) {
      // "1,200" / "1.200" → thousands; "12,5" / "12.50" / "0.125" → decimal.
      const thousands = parts[1].length === 3 && parts[0].length > 0 && parts[0] !== "0"
      s = thousands ? parts.join("") : parts.join(".")
    } else {
      const western = parts.slice(1).every((g) => g.length === 3)
      // Indian lakh grouping: "1,20,000" → 2-digit middle groups, 3-digit last group.
      const indian = parts.slice(1, -1).every((g) => g.length === 2) && parts.at(-1).length === 3
      if (!western && !indian) return NaN // e.g. "1.2.3"
      s = parts.join("")
    }
  }

  const n = Number(s)
  if (!Number.isFinite(n)) return NaN
  return negative ? -n : n
}

/** Number → integer minor units, rounding half away from zero. */
export const toCents = (n) => Math.round(n * 100 + (n >= 0 ? 1e-9 : -1e-9))

/** Integer minor units → number. */
export const fromCents = (c) => c / 100

/** Parse a percentage-ish discount: "10", "10%", "0.1" (treated as 10%). Returns 0..100 or NaN. */
export function parsePercent(input) {
  if (input === null || input === undefined || input === "") return NaN
  const raw = String(input).trim()
  const n = parsePrice(raw.replace("%", ""))
  if (!Number.isFinite(n)) return NaN
  const pct = !raw.includes("%") && n > 0 && n < 1 ? n * 100 : n
  return pct >= 0 && pct <= 100 ? pct : NaN
}

let formatters = null
let currencyCode = "USD"

export function setCurrency(code) {
  currencyCode = code
  formatters = null
}

export function getCurrency() {
  return currencyCode
}

function makeFormatter(digits) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode, minimumFractionDigits: digits, maximumFractionDigits: digits })
  } catch {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
  }
}

/** Whole amounts print without decimals ($500); anything else always shows two ($68.40). */
export function formatMoney(cents) {
  if (!formatters) formatters = { whole: makeFormatter(0), frac: makeFormatter(2) }
  return (cents % 100 === 0 ? formatters.whole : formatters.frac).format(cents / 100)
}

/** Guess an ISO currency code from raw price strings (first symbol that appears). */
export function detectCurrency(samples) {
  const map = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₹": "INR", "₩": "KRW", "₽": "RUB", "₺": "TRY", "₱": "PHP", "₦": "NGN", "₪": "ILS", "฿": "THB" }
  for (const s of samples) {
    const str = String(s ?? "")
    for (const [sym, code] of Object.entries(map)) if (str.includes(sym)) return code
    const m = str.match(/\b(usd|eur|gbp|inr|jpy|aud|cad|sgd|aed|chf)\b/i)
    if (m) return m[1].toUpperCase()
    if (/\brs\.?\b/i.test(str)) return "INR"
  }
  return null
}
