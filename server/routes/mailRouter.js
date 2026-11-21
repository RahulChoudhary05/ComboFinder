const express = require("express")
const { sendMail } = require("../utils/mailSender")
const { renderResultsEmail, renderResultsCsv } = require("../utils/template")

const router = express.Router()

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/
const MAX_COMBOS = 200
const MAX_ITEMS = 6

// Simple fixed-window rate limiter: 5 emails per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count++
  return entry.count > LIMIT
}
setInterval(() => {
  const now = Date.now()
  for (const [ip, e] of hits) if (now - e.start > WINDOW_MS) hits.delete(ip)
}, WINDOW_MS).unref()

const str = (v, max = 200) => String(v ?? "").slice(0, max)
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

/**
 * POST /api/mail/results
 * Body: { to, currency, summary: {...}, combos: [{ total, items: [{ name, sku, category, price }] }] }
 * The server renders the email from a fixed template – clients can no longer send arbitrary HTML.
 */
router.post("/results", async (req, res) => {
  const { to, currency, summary = {}, combos } = req.body || {}

  if (typeof to !== "string" || !EMAIL_RE.test(to.trim()) || to.length > 254) {
    return res.status(400).json({ message: "Please provide a valid email address." })
  }
  if (!Array.isArray(combos) || combos.length === 0) {
    return res.status(400).json({ message: "No results to send." })
  }
  if (rateLimited(req.ip)) {
    return res.status(429).json({ message: "Too many emails. Please try again in a few minutes." })
  }

  const clean = {
    currency: /^[A-Z]{3}$/.test(currency) ? currency : "USD",
    summary: {
      fileName: str(summary.fileName, 120),
      min: num(summary.min),
      max: num(summary.max),
      minItems: num(summary.minItems),
      maxItems: num(summary.maxItems),
      matches: num(summary.matches),
      sortLabel: str(summary.sortLabel, 60),
    },
    combos: combos.slice(0, MAX_COMBOS).map((c) => ({
      total: num(c?.total),
      items: (Array.isArray(c?.items) ? c.items : []).slice(0, MAX_ITEMS).map((p) => ({
        name: str(p?.name),
        sku: str(p?.sku, 60),
        category: str(p?.category, 60),
        price: num(p?.price),
      })),
    })),
  }

  try {
    await sendMail({
      to: to.trim(),
      subject: `Your ComboFinder results: ${clean.summary.matches.toLocaleString("en")} matches`,
      text: `ComboFinder found ${clean.summary.matches} matches between ${clean.summary.min} and ${clean.summary.max} ${clean.currency}. The top ${clean.combos.length} are attached as CSV.`,
      html: renderResultsEmail(clean),
      attachments: [{ filename: "combofinder-results.csv", content: "﻿" + renderResultsCsv(clean), contentType: "text/csv; charset=utf-8" }],
    })
    res.json({ message: "Email sent." })
  } catch (error) {
    console.error("mail error:", error.message)
    res.status(502).json({ message: "The mail service could not send the email." })
  }
})

module.exports = router
