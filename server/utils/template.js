// Server-side email rendering. Every value is HTML-escaped; CSV cells are formula-injection safe.

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

function money(n, currency) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(n)
  } catch {
    return `${n} ${currency}`
  }
}

function renderResultsEmail({ currency, summary, combos }) {
  const rows = combos
    .map(
      (c, i) => `
      <tr style="background:${i % 2 ? "#f8fafc" : "#ffffff"}">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:12px;vertical-align:top">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a">
          ${c.items
            .map(
              (p) =>
                `<div style="margin:2px 0"><strong>${esc(p.name)}</strong> <span style="color:#64748b">${esc(money(p.price, currency))}${p.category ? " · " + esc(p.category) : ""}${p.sku ? " · #" + esc(p.sku) : ""}</span></div>`,
            )
            .join("")}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#047857;white-space:nowrap;vertical-align:top">${esc(money(c.total, currency))}</td>
      </tr>`,
    )
    .join("")

  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:24px 12px">
    <div style="background:linear-gradient(135deg,#4338ca,#c026d3);border-radius:16px 16px 0 0;padding:24px;color:#fff">
      <div style="font-size:22px;font-weight:800">ComboFinder</div>
      <div style="opacity:.85;font-size:14px;margin-top:4px">${esc(summary.matches.toLocaleString("en"))} matches between ${esc(money(summary.min, currency))} and ${esc(money(summary.max, currency))}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:20px;border:1px solid #e2e8f0;border-top:none">
      <p style="margin:0 0 12px;color:#475569;font-size:13px">
        Source: <strong>${esc(summary.fileName || "uploaded file")}</strong> · bundle size ${esc(summary.minItems)}–${esc(summary.maxItems)} · ranked by ${esc(summary.sortLabel.toLowerCase())}.
        Showing the top ${combos.length}. The full list is attached as CSV.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f1f5f9;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b">
          <th style="padding:8px 12px">#</th><th style="padding:8px 12px">Products</th><th style="padding:8px 12px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center">Sent by ComboFinder · combofinder.vercel.app</p>
    </div>
  </div></body></html>`
}

const cell = (v) => {
  let s = String(v ?? "")
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function renderResultsCsv({ currency, combos }) {
  const lines = [["Combo #", `Total (${currency})`, "Product", "SKU", "Category", "Price"].map(cell).join(",")]
  combos.forEach((c, i) => c.items.forEach((p) => lines.push([i + 1, c.total, p.name, p.sku, p.category, p.price].map(cell).join(","))))
  return lines.join("\r\n")
}

module.exports = { renderResultsEmail, renderResultsCsv, esc }
