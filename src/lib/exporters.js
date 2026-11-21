// Export results as CSV, Excel (multi-sheet) or JSON.

import { fromCents } from "./price.js"

/** Prevent CSV/Excel formula injection (OWASP): prefix cells that a spreadsheet would evaluate. */
export function safeCell(v) {
  if (typeof v !== "string") return v
  return /^[=+\-@\t\r]/.test(v) && !/^-?\d+(\.\d+)?$/.test(v) ? `'${v}` : v
}

export function csvEscape(v) {
  const s = String(safeCell(v ?? ""))
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(rows) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n")
}

/** One row per combo – the "summary" view. */
export function comboRows(combos, byId, { priceField = "priceCents", currency = "" } = {}) {
  const header = ["Combo #", "Items", "Total", "Discount saving", "Products", "SKUs", "Categories"]
  const rows = combos.map((c, i) => {
    const items = c.items.map((id) => byId.get(id))
    return [
      i + 1,
      items.length,
      fromCents(c.total),
      fromCents(c.saving || 0),
      items.map((p) => `${p.name} (${fromCents(p[priceField])})`).join(" + "),
      items.map((p) => p.sku).filter(Boolean).join(" | "),
      [...new Set(items.map((p) => p.category).filter(Boolean))].join(" | "),
    ]
  })
  if (currency) header[2] = `Total (${currency})`
  return [header, ...rows]
}

/** One row per product per combo – easy to pivot/filter in Excel. */
export function lineItemRows(combos, byId, extraHeaders = []) {
  const header = ["Combo #", "Combo total", "Product no.", "Product", "Category", "Price", "Discount %", "Final price", "In stock", ...extraHeaders]
  const rows = []
  combos.forEach((c, i) => {
    for (const id of c.items) {
      const p = byId.get(id)
      rows.push([
        i + 1,
        fromCents(c.total),
        p.sku,
        p.name,
        p.category,
        fromCents(p.priceCents),
        p.discountPct || "",
        fromCents(p.finalCents),
        p.inStock ? "Yes" : "No",
        ...extraHeaders.map((h) => p.extra[h] ?? ""),
      ])
    }
  })
  return [header, ...rows]
}

export function summaryRows(meta) {
  return [
    ["ComboFinder export"],
    ["Generated", new Date().toLocaleString()],
    ["Source file", meta.fileName],
    ["Price range", `${fromCents(meta.min)} – ${fromCents(meta.max)}`],
    ["Bundle size", `${meta.minItems} – ${meta.maxItems} items`],
    ["Price basis", meta.priceField === "finalCents" ? "After discount" : "List price"],
    ["Sorted by", meta.sortLabel],
    ["Matches found", meta.matches],
    ["Rows exported", meta.exported],
    ["Search complete", meta.complete ? "Yes" : "No – stopped at work budget"],
    ["Search time (ms)", meta.elapsedMs],
  ]
}

export async function toXLSX({ summary, combos, lineItems }) {
  const XLSX = await import("xlsx")
  const wb = XLSX.utils.book_new()
  const add = (name, aoa, widths) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa.map((r) => r.map(safeCell)))
    if (widths) ws["!cols"] = widths.map((w) => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  add("Summary", summary, [22, 40])
  add("Combos", combos, [9, 7, 12, 14, 80, 30, 30])
  add("Line items", lineItems, [9, 12, 14, 32, 18, 10, 11, 11, 9])
  return XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true })
}

export function downloadBlob(data, fileName, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportFileName(base, ext) {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")
  return `${base}-${stamp}.${ext}`
}
