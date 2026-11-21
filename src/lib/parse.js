// Multi-format catalogue import: CSV / TSV / TXT (Papa Parse), Excel / ODS / Numbers (SheetJS, lazy
// loaded), and JSON. Every format is normalised to the same shape:
//   { fileName, format, sheets: [{ name, headers: string[], rows: any[][], headerRow: number }] }

import Papa from "papaparse"

export const MAX_FILE_BYTES = 25 * 1024 * 1024
export const ACCEPT = ".csv,.tsv,.txt,.xlsx,.xlsm,.xlsb,.xls,.ods,.numbers,.json"

const SPREADSHEET_EXT = ["xlsx", "xlsm", "xlsb", "xls", "ods", "numbers", "fods"]
const TEXT_EXT = ["csv", "tsv", "txt", "tab"]

export function extensionOf(name = "") {
  const m = /\.([a-z0-9]+)$/i.exec(name)
  return m ? m[1].toLowerCase() : ""
}

export async function parseFile(file) {
  if (!file) throw new Error("No file selected.")
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${MAX_FILE_BYTES / 1048576} MB.`)
  }
  const ext = extensionOf(file.name)
  if (SPREADSHEET_EXT.includes(ext)) {
    return { fileName: file.name, format: ext, sheets: await parseWorkbook(await file.arrayBuffer()) }
  }
  if (ext === "json") {
    return { fileName: file.name, format: "json", sheets: parseJsonText(await file.text()) }
  }
  if (TEXT_EXT.includes(ext) || file.type.startsWith("text/") || !ext) {
    return { fileName: file.name, format: ext || "csv", sheets: parseDelimitedText(await file.text(), file.name) }
  }
  throw new Error(`Unsupported file type ".${ext}". Use CSV, TSV, Excel (.xlsx/.xls), ODS or JSON.`)
}

// ---------------------------------------------------------------- delimited text

export function parseDelimitedText(text, name = "Data") {
  const clean = String(text ?? "").replace(/^﻿/, "")
  if (!clean.trim()) throw new Error("The file is empty.")
  const result = Papa.parse(clean, {
    skipEmptyLines: "greedy",
    delimitersToGuess: [",", "\t", ";", "|"],
  })
  const fatal = result.errors.find((e) => e.type === "Delimiter" && result.data.length <= 1)
  if (fatal) throw new Error("Could not detect the column separator in this file.")
  return [toSheet(sheetNameFrom(name), result.data)]
}

// ---------------------------------------------------------------- spreadsheets

export async function parseWorkbook(arrayBuffer) {
  const XLSX = await import("xlsx")
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true, dense: true })
  const sheets = []
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    // Keep blank rows so reported row numbers match what the user sees in Excel.
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "", blankrows: true })
    const cleaned = aoa.map((row) => row.map(normaliseCell))
    if (cleaned.some((r) => r.some((c) => c !== ""))) sheets.push(toSheet(sheetName, cleaned))
  }
  if (!sheets.length) throw new Error("The workbook has no sheets with data.")
  return sheets
}

function normaliseCell(v) {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return ""
    const iso = v.toISOString()
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.slice(0, 16).replace("T", " ")
  }
  if (typeof v === "string") return v.trim()
  return v ?? ""
}

// ---------------------------------------------------------------- JSON

export function parseJsonText(text) {
  let data
  try {
    data = JSON.parse(String(text).replace(/^﻿/, ""))
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`)
  }
  if (!Array.isArray(data) && data && typeof data === "object") {
    const arr = Object.values(data).find((v) => Array.isArray(v) && v.some((x) => x && typeof x === "object"))
    if (!arr) throw new Error("JSON must be an array of objects, or an object containing one.")
    data = arr
  }
  if (!Array.isArray(data) || !data.length) throw new Error("JSON contains no records.")
  const objects = data.filter((x) => x && typeof x === "object" && !Array.isArray(x))
  if (!objects.length) throw new Error("JSON records must be objects like { \"name\": …, \"price\": … }.")
  const keys = []
  const seen = new Set()
  for (const o of objects.slice(0, 2000)) for (const k of Object.keys(o)) if (!seen.has(k)) seen.add(k), keys.push(k)
  const rows = objects.map((o) =>
    keys.map((k) => {
      const v = o[k]
      if (v === null || v === undefined) return ""
      return typeof v === "object" ? JSON.stringify(v) : v
    }),
  )
  return [{ name: "JSON", headers: dedupeHeaders(keys), rows, headerRow: 0 }]
}

// ---------------------------------------------------------------- helpers

/** Excel files often start with a title or blank rows; pick the most header-like row in the first 15. */
export function detectHeaderRow(aoa) {
  const limit = Math.min(aoa.length, 15)
  const width = Math.max(...aoa.slice(0, 50).map((r) => r.filter((c) => c !== "" && c !== null).length), 0)
  let best = 0
  let bestScore = -Infinity
  for (let i = 0; i < limit; i++) {
    const row = aoa[i]
    const filled = row.filter((c) => c !== "" && c !== null && c !== undefined)
    if (!filled.length) continue
    const textual = filled.filter((c) => typeof c === "string" && Number.isNaN(Number(c))).length
    const unique = new Set(filled.map(String)).size
    // Favour rows that are wide, mostly text, all distinct, and appear early.
    const score = filled.length / Math.max(width, 1) * 2 + textual / filled.length + unique / filled.length - i * 0.05
    if (filled.length >= Math.min(2, width) && score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

export function dedupeHeaders(headers) {
  const counts = new Map()
  return headers.map((h, i) => {
    let name = String(h ?? "").trim() || `Column ${i + 1}`
    const n = (counts.get(name) || 0) + 1
    counts.set(name, n)
    if (n > 1) name = `${name} (${n})`
    return name
  })
}

function toSheet(name, aoa) {
  const headerRow = detectHeaderRow(aoa)
  const rawHeaders = aoa[headerRow] || []
  const body = aoa.slice(headerRow + 1)
  const width = Math.max(rawHeaders.length, ...body.slice(0, 500).map((r) => r.length))
  const headers = dedupeHeaders(Array.from({ length: width }, (_, i) => rawHeaders[i]))
  const rows = body
    .map((r) => Array.from({ length: width }, (_, i) => (r[i] === undefined || r[i] === null ? "" : r[i])))
    .filter((r) => r.some((c) => c !== ""))
  if (!rows.length) throw new Error(`"${name}" has a header row but no data rows.`)
  // Drop fully empty trailing columns that only exist because of stray formatting.
  const keep = headers.map((h, i) => !/^Column \d+$/.test(h) || rows.some((r) => r[i] !== ""))
  return {
    name,
    headerRow,
    headers: headers.filter((_, i) => keep[i]),
    rows: rows.map((r) => r.filter((_, i) => keep[i])),
  }
}

function sheetNameFrom(fileName) {
  return String(fileName).replace(/\.[^.]+$/, "") || "Data"
}
