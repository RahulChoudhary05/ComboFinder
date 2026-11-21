import { describe, it, expect } from "vitest"
import { parsePrice, toCents, parsePercent } from "./price.js"
import { parseDelimitedText, parseJsonText, detectHeaderRow } from "./parse.js"
import { inferMapping } from "./columns.js"
import { buildDataset } from "./dataset.js"
import { findCombos, bruteForceCount } from "./comboEngine.js"
import { csvEscape, safeCell } from "./exporters.js"

describe("parsePrice", () => {
  it.each([
    ["1200", 1200],
    ["$1,200.50", 1200.5],
    ["₹ 1,20,000", 120000],
    ["1.234,56 €", 1234.56],
    ["12,5", 12.5],
    ["12.50", 12.5],
    ["0.125", 0.125],
    ["(12.50)", -12.5],
    ["1 299", 1299],
    ["Rs. 499", 499],
    ["USD 49.99", 49.99],
    [80, 80],
  ])("%s → %s", (input, expected) => expect(parsePrice(input)).toBeCloseTo(expected, 6))

  it.each(["", "abc", "1.2.3", null, "N/A", "—"])("%s → NaN", (input) => expect(parsePrice(input)).toBeNaN())

  it("uses exact cents", () => {
    expect(toCents(0.1) + toCents(0.2)).toBe(toCents(0.3))
    expect(toCents(19.99)).toBe(1999)
  })

  it("parses percentages", () => {
    expect(parsePercent("10%")).toBe(10)
    expect(parsePercent("0.15")).toBeCloseTo(15)
    expect(parsePercent("150")).toBeNaN()
  })
})

describe("parseDelimitedText", () => {
  it("handles quoted commas, CRLF and BOM", () => {
    const [sheet] = parseDelimitedText('﻿Name,Price,Desc\r\n"Laptop, 15""",1200,"Fast, light"\r\nMouse,80,Wireless\r\n')
    expect(sheet.headers).toEqual(["Name", "Price", "Desc"])
    expect(sheet.rows[0]).toEqual(['Laptop, 15"', "1200", "Fast, light"])
    expect(sheet.rows).toHaveLength(2)
  })

  it("detects semicolon and tab delimiters", () => {
    expect(parseDelimitedText("a;b\n1;2\n3;4")[0].headers).toEqual(["a", "b"])
    expect(parseDelimitedText("a\tb\n1\t2\n3\t4")[0].headers).toEqual(["a", "b"])
  })

  it("skips title rows above the real header", () => {
    const aoa = [["Product catalogue 2025", "", ""], ["", "", ""], ["SKU", "Name", "Price"], ["1", "A", "10"]]
    expect(detectHeaderRow(aoa)).toBe(2)
  })
})

describe("parseWorkbook (Excel)", () => {
  it("reads every sheet and skips the title row", async () => {
    const { sampleXLSX } = await import("./samples.js")
    const { parseWorkbook } = await import("./parse.js")
    const sheets = await parseWorkbook(await sampleXLSX())
    expect(sheets.map((s) => s.name)).toEqual(["Tech", "Home & Office"])
    expect(sheets[0].headerRow).toBe(2)
    expect(sheets[0].headers[1]).toBe("ProductName")
    expect(sheets[0].rows.length + sheets[1].rows.length).toBe(30)
    const { mapping } = inferMapping(sheets[0].headers, sheets[0].rows)
    expect(sheets[0].headers[mapping.price]).toBe("ProductPrice")
  })
})

describe("parseJsonText", () => {
  it("accepts arrays and wrapped arrays", () => {
    expect(parseJsonText('[{"name":"A","price":1}]')[0].headers).toEqual(["name", "price"])
    expect(parseJsonText('{"products":[{"name":"A","price":1},{"name":"B","price":2,"tag":"x"}]}')[0].headers).toEqual(["name", "price", "tag"])
  })
})

describe("inferMapping", () => {
  it("maps the v1 sample correctly (ProductNo is not the name)", () => {
    const [sheet] = parseDelimitedText(
      "ProductNo,ProductName,ProductDesc,ProductPrice,Discount,Category,InStock\n1001,Laptop,High performance laptop,1200,0,Electronics,Yes\n1002,Mouse,Wireless gaming mouse,80,5,Electronics,Yes\n1003,Desk,Oak standing desk,350,10,Furniture,No",
    )
    const { mapping } = inferMapping(sheet.headers, sheet.rows)
    expect(sheet.headers[mapping.name]).toBe("ProductName")
    expect(sheet.headers[mapping.price]).toBe("ProductPrice")
    expect(sheet.headers[mapping.sku]).toBe("ProductNo")
    expect(sheet.headers[mapping.category]).toBe("Category")
    expect(sheet.headers[mapping.stock]).toBe("InStock")
    expect(sheet.headers[mapping.discount]).toBe("Discount")
    expect(sheet.headers[mapping.description]).toBe("ProductDesc")
  })
})

describe("buildDataset", () => {
  it("reports bad rows and duplicates, applies discounts", () => {
    const [sheet] = parseDelimitedText("sku,name,price,discount\n1,A,100,10\n2,B,abc,0\n3,,50,0\n1,A again,100,0\n4,C,-5,0")
    const ds = buildDataset(sheet, { sku: 0, name: 1, price: 2, discount: 3 })
    expect(ds.products).toHaveLength(1)
    expect(ds.products[0].finalCents).toBe(9000)
    expect(ds.report.issues).toEqual({ missingName: 1, invalidPrice: 1, negativePrice: 1, duplicates: 1 })
  })
})

// ------------------------------------------------------------------ engine

function makeProducts(prices, cats = []) {
  return prices.map((p, i) => ({
    id: i,
    name: `P${i}`,
    priceCents: p,
    finalCents: p,
    category: cats[i] || "",
    inStock: true,
  }))
}

function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

describe("findCombos", () => {
  it("finds singles and pairs in range", () => {
    const r = findCombos(makeProducts([100, 200, 300, 400]), { min: 300, max: 400, minItems: 1, maxItems: 2 })
    // singles: 300, 400 ; pairs: 100+200, 100+300
    expect(r.matches).toBe(4)
    expect(r.bySize).toEqual({ 1: 2, 2: 2 })
    expect(r.complete).toBe(true)
  })

  it("matches brute force on random data for every sort", () => {
    const rand = rng(42)
    for (let t = 0; t < 30; t++) {
      const n = 5 + Math.floor(rand() * 14)
      const prices = Array.from({ length: n }, () => 100 + Math.floor(rand() * 900))
      const min = 500 + Math.floor(rand() * 800)
      const max = min + Math.floor(rand() * 400)
      const kMin = 1 + Math.floor(rand() * 2)
      const kMax = kMin + Math.floor(rand() * 3)
      const expected = bruteForceCount(prices, min, max, kMin, kMax)
      for (const sortBy of ["closest", "cheapest", "priciest", "fewest", "saving"]) {
        const r = findCombos(makeProducts(prices), { min, max, minItems: kMin, maxItems: kMax, sortBy, limit: 100000 })
        expect(r.matches).toBe(expected)
        expect(r.combos).toHaveLength(expected)
        for (const c of r.combos) {
          expect(c.total).toBeGreaterThanOrEqual(min)
          expect(c.total).toBeLessThanOrEqual(max)
          expect(new Set(c.items).size).toBe(c.items.length)
        }
      }
    }
  })

  it("top-K keeps the best results and still counts all matches", () => {
    const prices = Array.from({ length: 60 }, (_, i) => 100 + i * 7)
    const all = findCombos(makeProducts(prices), { min: 600, max: 900, minItems: 2, maxItems: 3, sortBy: "cheapest", limit: 1e6 })
    const top = findCombos(makeProducts(prices), { min: 600, max: 900, minItems: 2, maxItems: 3, sortBy: "cheapest", limit: 25 })
    expect(top.matches).toBe(all.matches)
    expect(top.combos.map((c) => c.total)).toEqual(all.combos.slice(0, 25).map((c) => c.total))
  })

  it("closest-to-target ordering is non-decreasing in distance", () => {
    const prices = Array.from({ length: 80 }, (_, i) => 50 + ((i * 37) % 400))
    const r = findCombos(makeProducts(prices), { min: 400, max: 800, minItems: 1, maxItems: 3, target: 555, limit: 200 })
    const d = r.combos.map((c) => Math.abs(c.total - 555))
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThanOrEqual(d[i - 1])
  })

  it("respects one-per-category, must-include, exclude and stock", () => {
    const ps = makeProducts([100, 150, 200, 250], ["A", "A", "B", "B"])
    ps[3].inStock = false
    const r = findCombos(ps, { min: 0, max: 10000, minItems: 2, maxItems: 2, distinctCategory: true, inStockOnly: true, limit: 100 })
    // pairs across categories with item 3 out of stock: (0,2), (1,2)
    expect(r.matches).toBe(2)
    const must = findCombos(ps, { min: 0, max: 10000, minItems: 2, maxItems: 2, mustInclude: [0], exclude: [2], limit: 100 })
    expect(must.combos.every((c) => c.items.includes(0) && !c.items.includes(2))).toBe(true)
    expect(must.matches).toBe(2) // (0,1), (0,3)
  })

  it("stops at the work budget and reports a partial result", () => {
    const prices = Array.from({ length: 200 }, (_, i) => 100 + i)
    const r = findCombos(makeProducts(prices), { min: 0, max: 1e9, minItems: 4, maxItems: 4, budget: 10000, limit: 10 })
    expect(r.complete).toBe(false)
  })

  it("rejects inverted ranges", () => {
    expect(() => findCombos(makeProducts([1]), { min: 10, max: 5 })).toThrow()
  })
})

describe("Excel export", () => {
  it("writes Summary / Combos / Line items sheets that read back", async () => {
    const { toXLSX, comboRows, lineItemRows, summaryRows } = await import("./exporters.js")
    const { parseWorkbook } = await import("./parse.js")
    const ps = makeProducts([100, 200, 300]).map((p) => ({ ...p, sku: `S${p.id}`, discountPct: 0, extra: { Supplier: "=EVIL()" } }))
    const byId = new Map(ps.map((p) => [p.id, p]))
    const r = findCombos(ps, { min: 300, max: 500, minItems: 1, maxItems: 2 })
    const meta = { fileName: "t.csv", min: 300, max: 500, minItems: 1, maxItems: 2, sortLabel: "Closest", matches: r.matches, exported: r.combos.length, complete: true, elapsedMs: 1 }
    const buf = await toXLSX({ summary: summaryRows(meta), combos: comboRows(r.combos, byId), lineItems: lineItemRows(r.combos, byId, ["Supplier"]) })
    const sheets = await parseWorkbook(buf)
    expect(sheets.map((s) => s.name)).toEqual(["Summary", "Combos", "Line items"])
    expect(sheets[1].rows).toHaveLength(r.matches)
    expect(sheets[2].rows.every((row) => row.at(-1) === "'=EVIL()")).toBe(true)
  })
})

describe("exporters", () => {
  it("guards against formula injection and escapes CSV", () => {
    expect(safeCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)")
    expect(safeCell("-5")).toBe("-5")
    expect(csvEscape('a,"b"')).toBe('"a,""b"""')
  })
})
