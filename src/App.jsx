import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import {
  Upload, SlidersHorizontal, BarChart3, ListChecks, Sparkles, Search, FileSpreadsheet, FileText, FileJson, Printer, Trash2,
  Columns3, Keyboard, User, Layers, ArrowDownUp, ToggleRight, SearchX, Github,
} from "lucide-react"

import Background from "./components/Background"
import { Sidebar, MobileTopBar, BottomNav } from "./components/Navigation"
import Footer from "./components/Footer"
import FileUploader from "./components/FileUploader"
import ColumnMapper from "./components/ColumnMapper"
import DataInsights from "./components/DataInsights"
import SearchPanel, { SIZE_PRESETS } from "./components/SearchPanel"
import ResultsPanel from "./components/ResultsPanel"
import DeveloperProfile from "./components/DeveloperProfile"
import Toast from "./components/Toast"
import CommandPalette from "./components/ui/CommandPalette"
import ShortcutsDialog from "./components/ui/ShortcutsDialog"
import ConfirmDialog from "./components/ui/ConfirmDialog"
import { InsightsSkeleton, ResultsSkeleton } from "./components/ui/Skeleton"

import { parseFile, parseDelimitedText } from "./lib/parse"
import { inferMapping } from "./lib/columns"
import { buildDataset } from "./lib/dataset"
import { toCents, setCurrency, formatMoney, fromCents } from "./lib/price"
import { SORTS } from "./lib/comboEngine"
import { useComboSearch } from "./lib/useComboSearch"
import { sampleCSV } from "./lib/samples"
import { comboRows, lineItemRows, summaryRows, toCSV, toXLSX, downloadBlob, exportFileName } from "./lib/exporters"
import { useHotkeys, useScrollSpy, useDebouncedCallback, storage } from "./lib/hooks"
import { API_URL, DEVELOPER } from "./config"

const DEFAULT_PARAMS = {
  min: "490",
  max: "510",
  target: "",
  minItems: 1,
  maxItems: 3,
  sortBy: "closest",
  limit: 5000,
  priceField: "priceCents",
  inStockOnly: false,
  distinctCategory: false,
  mustInclude: [],
  exclude: [],
}
const K_SETTINGS = "cf:v2:settings"
const K_SESSION = "cf:v2:session"
const SESSION_MAX_CHARS = 2_000_000

function useToasts() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const push = useCallback(
    (type, message, action) => {
      const id = ++idRef.current
      setToasts((t) => [...t.slice(-2), { id, type, message, action }])
      setTimeout(() => dismiss(id), action ? 8000 : type === "error" ? 7000 : 4000)
    },
    [dismiss],
  )
  return { toasts, push, dismiss }
}

const pickLargestSheet = (sheets) => sheets.reduce((best, s, i) => (s.rows.length > sheets[best].rows.length ? i : best), 0)
const SECTION_IDS = ["upload", "budget", "insights", "results"]

export default function App() {
  const { toasts, push, dismiss } = useToasts()

  // dialogs
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [showMapper, setShowMapper] = useState(false)

  // data
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [sheetIndex, setSheetIndex] = useState(0)
  const [mapping, setMapping] = useState({})
  const [confidence, setConfidence] = useState({})
  const [dataset, setDataset] = useState(null)
  const [source, setSource] = useState({ fileName: "", sheetName: "" })

  // search
  const saved = useMemo(() => storage.get(K_SETTINGS, null), [])
  const [currency, setCurrencyState] = useState(saved?.currency || "USD")
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...(saved?.params || {}) }))
  const [result, setResult] = useState(null)
  const [exportBusy, setExportBusy] = useState(null)
  const search = useComboSearch()
  const resultSeq = useRef(0)

  const fileInputRef = useRef(null)
  const filterRef = useRef(null)

  useMemo(() => setCurrency(currency), [currency]) // formatter must update before children render

  const byId = useMemo(() => new Map((dataset?.products || []).map((p) => [p.id, p])), [dataset])
  const sortedPrices = useMemo(
    () => (dataset ? Int32Array.from(dataset.products, (p) => p[params.priceField]).sort() : null),
    [dataset, params.priceField],
  )

  // ------------------------------------------------------------ autosave (debounced)

  const saveSettings = useDebouncedCallback((p, c) => storage.set(K_SETTINGS, { params: p, currency: c }), 400)
  useEffect(() => saveSettings(params, currency), [params, currency, saveSettings])

  const loadDataset = useCallback(
    (sheet, map, meta, { silent = false } = {}) => {
      const ds = buildDataset(sheet, map)
      if (!ds.products.length) throw new Error("No valid rows. Check that the price column contains numbers.")
      setDataset(ds)
      setSource(meta)
      if (ds.currency) setCurrencyState(ds.currency)
      setResult(null)
      setParams((p) => {
        const next = {
          ...p,
          priceField: ds.hasDiscount ? p.priceField : "priceCents",
          inStockOnly: ds.hasStock && p.inStockOnly,
          distinctCategory: ds.hasCategory && p.distinctCategory,
          sortBy: p.sortBy === "saving" && !ds.hasDiscount ? "closest" : p.sortBy,
        }
        if (!silent) Object.assign(next, { mustInclude: [], exclude: [] })
        // Re-anchor a range that cannot match anything in this catalogue on its median.
        const prices = ds.products.map((x) => x.priceCents).sort((a, b) => a - b)
        if (toCents(Number(next.max)) < prices[0] || toCents(Number(next.min)) > prices.at(-1) * next.maxItems) {
          const m = fromCents(ds.report.stats.median)
          Object.assign(next, { target: String(m), min: String(+(m * 0.95).toFixed(2)), max: String(+(m * 1.05).toFixed(2)) })
        }
        return next
      })
      return ds
    },
    [],
  )

  // Restore last session once.
  useEffect(() => {
    const s = storage.get(K_SESSION, null)
    if (!s?.sheet) return
    try {
      loadDataset(s.sheet, s.mapping, { fileName: s.fileName, sheetName: s.sheetName }, { silent: true })
      setParsed({ fileName: s.fileName, format: s.format, sheets: [s.sheet] })
      setSheetIndex(0)
      setMapping(s.mapping)
      push("info", `Restored ${s.fileName} from your last visit.`, {
        label: "Start fresh",
        onClick: () => {
          storage.remove(K_SESSION)
          setDataset(null)
          setParsed(null)
          setResult(null)
        },
      })
    } catch {
      storage.remove(K_SESSION)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------ import

  const openMapper = useCallback((p, index) => {
    const sheet = p.sheets[index]
    const inferred = inferMapping(sheet.headers, sheet.rows)
    setSheetIndex(index)
    setMapping(inferred.mapping)
    setConfidence(inferred.confidence)
    setShowMapper(true)
  }, [])

  const handleFile = async (file) => {
    setParsing(true)
    try {
      const p = await parseFile(file)
      setParsed(p)
      openMapper(p, pickLargestSheet(p.sheets))
    } catch (e) {
      push("error", e.message || "Could not read that file.")
    } finally {
      setParsing(false)
    }
  }

  const trySample = useCallback(() => {
    const p = { fileName: "sample-catalogue.csv", format: "csv", sheets: parseDelimitedText(sampleCSV(), "Sample") }
    setParsed(p)
    openMapper(p, 0)
  }, [openMapper])

  const confirmMapping = () => {
    const sheet = parsed.sheets[sheetIndex]
    const meta = { fileName: parsed.fileName, sheetName: parsed.sheets.length > 1 ? sheet.name : "" }
    try {
      const ds = loadDataset(sheet, mapping, meta)
      setShowMapper(false)
      const session = { ...meta, format: parsed.format, sheet, mapping }
      const fits = JSON.stringify(session).length < SESSION_MAX_CHARS && storage.set(K_SESSION, session)
      if (!fits) storage.remove(K_SESSION)
      push("success", `Loaded ${ds.products.length.toLocaleString()} products${ds.report.skipped ? ` · ${ds.report.skipped} rows skipped` : ""}.`)
      setTimeout(() => navigate("budget"), 250)
    } catch (e) {
      push("error", e.message)
    }
  }

  const clearCatalogue = () => {
    search.cancel()
    storage.remove(K_SESSION)
    setDataset(null)
    setParsed(null)
    setResult(null)
    setParams((p) => ({ ...p, mustInclude: [], exclude: [] }))
    push("info", "Catalogue removed.")
  }

  // ------------------------------------------------------------ search

  const runSearch = useCallback(
    async (override) => {
      if (!dataset) return push("info", "Load a catalogue first.")
      const p = override || params
      const min = toCents(Number(p.min)), max = toCents(Number(p.max))
      if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return push("error", "Fix the price range first.")
      const target = p.target === "" ? null : toCents(Number(p.target))
      const slim = dataset.products.map(({ id, priceCents, finalCents, category, inStock }) => ({ id, priceCents, finalCents, category, inStock }))
      try {
        const r = await search.search(slim, { ...p, min, max, target })
        setResult({ ...r, id: ++resultSeq.current, params: { ...p, min, max } })
        if (r.matches) {
          push("success", `${r.matches.toLocaleString()} match${r.matches === 1 ? "" : "es"} in ${r.elapsedMs} ms.`)
          if (!override) setTimeout(() => navigate("results"), 120)
        } else if (!override) setTimeout(() => navigate("results"), 120)
      } catch (e) {
        if (!e.cancelled) push("error", e.message, { label: "Retry", onClick: () => runSearch(override) })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset, params, search.search],
  )

  // Optimistic pin/exclude: UI updates now, the search re-runs in the background.
  const rerun = useDebouncedCallback((p) => runSearch(p), 350)
  const updateParamsAndRerun = (fn) =>
    setParams((p) => {
      const next = fn(p)
      if (result) rerun(next)
      return next
    })
  const pin = (id) => {
    updateParamsAndRerun((p) => ({ ...p, mustInclude: p.mustInclude.includes(id) ? p.mustInclude.filter((x) => x !== id) : [...p.mustInclude, id], exclude: p.exclude.filter((x) => x !== id) }))
  }
  const exclude = (id) => {
    const name = byId.get(id)?.name
    const wasExcluded = params.exclude.includes(id)
    updateParamsAndRerun((p) => ({ ...p, exclude: wasExcluded ? p.exclude.filter((x) => x !== id) : [...p.exclude, id], mustInclude: p.mustInclude.filter((x) => x !== id) }))
    if (!wasExcluded)
      push("info", `Excluded ${name}.`, { label: "Undo", onClick: () => updateParamsAndRerun((p) => ({ ...p, exclude: p.exclude.filter((x) => x !== id) })) })
  }

  const recover = (patch) => {
    const next = { ...params, ...patch }
    setParams(next)
    runSearch(next)
  }

  // ------------------------------------------------------------ export

  const exportMeta = (combos) => ({
    fileName: source.fileName + (source.sheetName ? ` › ${source.sheetName}` : ""),
    min: result.params.min,
    max: result.params.max,
    minItems: result.params.minItems,
    maxItems: result.params.maxItems,
    priceField: result.params.priceField,
    sortLabel: SORTS[result.params.sortBy],
    matches: result.matches,
    exported: combos.length,
    complete: result.complete,
    elapsedMs: result.elapsedMs,
  })

  const handleExport = async (kind, subset) => {
    if (!result?.combos.length) return push("info", "Run a search first.")
    const combos = subset?.length ? subset : result.combos
    const base = subset?.length ? "combofinder-selection" : "combofinder-results"
    const opts = { priceField: result.params.priceField, currency }
    try {
      if (kind === "csv") downloadBlob("﻿" + toCSV(comboRows(combos, byId, opts)), exportFileName(base, "csv"), "text/csv;charset=utf-8")
      else if (kind === "json") {
        const json = {
          ...exportMeta(combos),
          currency,
          combos: combos.map((c, i) => ({
            rank: c.rank || i + 1,
            total: fromCents(c.total),
            saving: fromCents(c.saving || 0),
            products: c.items.map((id) => {
              const p = byId.get(id)
              return { sku: p.sku, name: p.name, category: p.category, price: fromCents(p.priceCents), finalPrice: fromCents(p.finalCents), inStock: p.inStock, ...p.extra }
            }),
          })),
        }
        downloadBlob(JSON.stringify(json, null, 2), exportFileName(base, "json"), "application/json")
      } else if (kind === "xlsx") {
        setExportBusy("xlsx")
        const data = await toXLSX({ summary: summaryRows(exportMeta(combos)), combos: comboRows(combos, byId, opts), lineItems: lineItemRows(combos, byId, dataset.extraHeaders) })
        downloadBlob(data, exportFileName(base, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      }
      push("success", `Downloaded ${combos.length.toLocaleString()} combos as ${kind === "xlsx" ? "Excel" : kind.toUpperCase()}.`)
    } catch (e) {
      push("error", `Export failed: ${e.message}`, { label: "Retry", onClick: () => handleExport(kind, subset) })
    } finally {
      setExportBusy(null)
    }
  }

  const handleEmail = async (to) => {
    setExportBusy("email")
    try {
      const top = result.combos.slice(0, 200)
      const res = await fetch(`${API_URL}/api/mail/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          currency,
          summary: {
            fileName: source.fileName,
            min: fromCents(result.params.min),
            max: fromCents(result.params.max),
            minItems: result.params.minItems,
            maxItems: result.params.maxItems,
            matches: result.matches,
            sortLabel: SORTS[result.params.sortBy],
          },
          combos: top.map((c) => ({
            total: fromCents(c.total),
            items: c.items.map((id) => {
              const p = byId.get(id)
              return { name: p.name, sku: p.sku, category: p.category, price: fromCents(p[result.params.priceField]) }
            }),
          })),
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || `Server responded ${res.status}`)
      push("success", `Sent ${top.length} combos to ${to}.`)
      return true
    } catch (e) {
      const msg = e.message === "Failed to fetch" ? "Mail server unreachable. It may be waking up." : e.message
      push("error", `Email failed: ${msg}`, { label: "Retry", onClick: () => handleEmail(to) })
      return false
    } finally {
      setExportBusy(null)
    }
  }

  // ------------------------------------------------------------ navigation, hotkeys, commands

  const active = useScrollSpy(SECTION_IDS)
  const navigate = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    el.focus?.({ preventScroll: true })
  }, [])

  const steps = [
    { id: "upload", label: "Catalogue", icon: Upload, status: dataset ? "done" : "ready", meta: dataset ? dataset.products.length.toLocaleString() : null },
    { id: "budget", label: "Budget", icon: SlidersHorizontal, status: result ? "done" : dataset ? "ready" : "idle" },
    { id: "insights", label: "Insights", icon: BarChart3, status: dataset ? "done" : "idle" },
    { id: "results", label: "Results", icon: ListChecks, status: result?.matches ? "done" : "idle", meta: result ? compact(result.matches) : null, disabled: !result && !search.running },
  ]

  const anyDialog = paletteOpen || shortcutsOpen || profileOpen || confirmClear || showMapper
  useHotkeys(
    {
      "mod+k": () => setPaletteOpen((v) => !v),
      "mod+enter": () => runSearch(),
      "?": () => setShortcutsOpen(true),
      "/": () => (filterRef.current ? (navigate("results"), setTimeout(() => filterRef.current?.focus(), 300)) : null),
      u: () => fileInputRef.current?.click(),
      s: () => trySample(),
      e: () => handleExport("xlsx"),
      escape: () => search.running && search.cancel(),
      1: () => navigate("upload"),
      2: () => navigate("budget"),
      3: () => navigate("insights"),
      4: () => navigate("results"),
    },
    !anyDialog,
  )
  // ⌘K must also close the palette while it is open.
  useHotkeys({ "mod+k": () => setPaletteOpen(false) }, paletteOpen)

  const set = (patch) => setParams((p) => ({ ...p, ...patch }))
  const commands = [
    { id: "go-upload", group: "Navigate", label: "Go to catalogue", icon: Upload, hint: "1", run: () => navigate("upload") },
    { id: "go-budget", group: "Navigate", label: "Go to budget & rules", icon: SlidersHorizontal, hint: "2", run: () => navigate("budget") },
    { id: "go-insights", group: "Navigate", label: "Go to insights", icon: BarChart3, hint: "3", run: () => navigate("insights") },
    { id: "go-results", group: "Navigate", label: "Go to results", icon: ListChecks, hint: "4", run: () => navigate("results"), disabled: !result },
    { id: "upload", group: "Data", label: "Upload a file…", icon: Upload, hint: "U", keywords: "open import csv excel xlsx json", run: () => fileInputRef.current?.click() },
    { id: "sample", group: "Data", label: "Load sample data", icon: Sparkles, hint: "S", keywords: "demo try", run: trySample },
    { id: "remap", group: "Data", label: "Change column mapping", icon: Columns3, keywords: "columns map", run: () => setShowMapper(true), disabled: !parsed },
    { id: "clear", group: "Data", label: "Remove catalogue…", icon: Trash2, keywords: "delete reset clear", run: () => setConfirmClear(true), disabled: !dataset },
    { id: "run", group: "Search", label: "Find combinations", icon: Search, hint: "Ctrl ↵", keywords: "run search go", run: () => runSearch(), disabled: !dataset },
    ...SIZE_PRESETS.map((p) => ({ id: `size-${p.label}`, group: "Search", label: `Bundle size: ${p.label}`, icon: Layers, run: () => set({ minItems: p.min, maxItems: p.max }) })),
    ...Object.entries(SORTS).map(([k, v]) => ({ id: `sort-${k}`, group: "Search", label: `Rank by: ${v}`, icon: ArrowDownUp, run: () => set({ sortBy: k }), disabled: k === "saving" && !dataset?.hasDiscount })),
    { id: "r-disc", group: "Rules", label: `${params.priceField === "finalCents" ? "Use list price" : "Use discounted price"}`, icon: ToggleRight, run: () => set({ priceField: params.priceField === "finalCents" ? "priceCents" : "finalCents" }), disabled: !dataset?.hasDiscount },
    { id: "r-stock", group: "Rules", label: `${params.inStockOnly ? "Include" : "Exclude"} out-of-stock products`, icon: ToggleRight, run: () => set({ inStockOnly: !params.inStockOnly }), disabled: !dataset?.hasStock },
    { id: "r-cat", group: "Rules", label: `${params.distinctCategory ? "Allow" : "Disallow"} repeated categories`, icon: ToggleRight, run: () => set({ distinctCategory: !params.distinctCategory }), disabled: !dataset?.hasCategory },
    { id: "x-xlsx", group: "Export", label: "Export results to Excel", icon: FileSpreadsheet, hint: "E", run: () => handleExport("xlsx"), disabled: !result?.combos.length },
    { id: "x-csv", group: "Export", label: "Export results to CSV", icon: FileText, run: () => handleExport("csv"), disabled: !result?.combos.length },
    { id: "x-json", group: "Export", label: "Export results to JSON", icon: FileJson, run: () => handleExport("json"), disabled: !result?.combos.length },
    { id: "x-print", group: "Export", label: "Print results", icon: Printer, run: () => window.print(), disabled: !result?.combos.length },
    { id: "help", group: "Help", label: "Keyboard shortcuts", icon: Keyboard, hint: "?", run: () => setShortcutsOpen(true) },
    { id: "dev", group: "Help", label: "Developer profile", icon: User, run: () => setProfileOpen(true) },
    { id: "repo", group: "Help", label: "View source on GitHub", icon: Github, run: () => window.open(DEVELOPER.links.repo, "_blank", "noopener") },
  ]

  // ------------------------------------------------------------ render

  const rangeMin = params.min === "" ? NaN : toCents(Number(params.min))
  const rangeMax = params.max === "" ? NaN : toCents(Number(params.max))
  const showResultsSkeleton = search.running && !result

  return (
    <>
      <Background />
      <a href="#main" className="sr-only z-[90] rounded-lg bg-white px-3 py-2 text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <Sidebar steps={steps} active={active} onNavigate={navigate} onOpenPalette={() => setPaletteOpen(true)} onOpenShortcuts={() => setShortcutsOpen(true)} onOpenProfile={() => setProfileOpen(true)} />

      <div className="lg:pl-60">
        <MobileTopBar onOpenPalette={() => setPaletteOpen(true)} onOpenProfile={() => setProfileOpen(true)} />

        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-28 pt-8 outline-none sm:px-6 lg:px-10 lg:pb-10 lg:pt-14">
          {/* Hero: one idea, one highlighted word, three plain steps. */}
          <header className="mb-8 lg:mb-10 print-hide">
            <h1 className="max-w-3xl text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.04em]">
              Find every product and bundle that fits your{" "}
              <mark className="rounded-[6px] bg-accent px-2 text-ink-950 [box-decoration-break:clone]">budget</mark>.
            </h1>
            <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-zinc-400">
              {["Add your product file", "Set a price range", "Download the matches"].map((t, i) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="num text-[12px] text-accent">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </header>

          <div className="grid gap-5 lg:grid-cols-12">
            <section id="upload" tabIndex={-1} className="card scroll-mt-20 outline-none lg:col-span-5 print-hide" aria-labelledby="upload-title">
              <div className="card-head">
                <div>
                  <h2 id="upload-title" className="card-title">
                    Product file
                  </h2>
                  <p className="card-sub">Any spreadsheet with names and prices.</p>
                </div>
              </div>
              <FileUploader
                inputRef={fileInputRef}
                onFile={handleFile}
                onTrySample={trySample}
                busy={parsing}
                onError={(m) => push("error", m)}
                loaded={dataset ? { fileName: source.fileName, sheetName: source.sheetName, count: dataset.products.length } : null}
                onRemap={() => parsed && setShowMapper(true)}
                onClear={() => setConfirmClear(true)}
              />
            </section>

            <div className="lg:col-span-7 print-hide">
              <SearchPanel
                params={params}
                setParams={setParams}
                dataset={dataset}
                currency={currency}
                byId={byId}
                sortedPrices={sortedPrices}
                onSearch={() => runSearch()}
                onCancel={search.cancel}
                running={search.running}
                progress={search.progress}
                liveMatches={search.matches}
                disabled={!dataset}
              />
            </div>

            <div className="lg:col-span-12 print-hide">
              {parsing ? (
                <div id="insights">
                  <InsightsSkeleton />
                </div>
              ) : dataset ? (
                <DataInsights dataset={dataset} currency={currency} onCurrencyChange={setCurrencyState} rangeMin={params.minItems === 1 ? rangeMin : NaN} rangeMax={params.minItems === 1 ? rangeMax : NaN} priceField={params.priceField} />
              ) : (
                <section id="insights" tabIndex={-1} className="card scroll-mt-20 outline-none">
                  <h2 className="card-title">Your catalogue</h2>
                  <p className="card-sub">Once a file is loaded you’ll see its price spread, any rows we skipped, and a searchable product list here.</p>
                </section>
              )}
            </div>

            <div className="lg:col-span-12">
              {showResultsSkeleton ? (
                <div id="results">
                  <ResultsSkeleton />
                </div>
              ) : result && result.matches > 0 ? (
                <ResultsPanel
                  result={result}
                  byId={byId}
                  categories={dataset?.report.categories || []}
                  params={params}
                  filterRef={filterRef}
                  onPin={pin}
                  onExclude={exclude}
                  onExport={handleExport}
                  onEmail={handleEmail}
                  exportBusy={exportBusy}
                  stale={search.running}
                />
              ) : result ? (
                <section id="results" className="card scroll-mt-20 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center text-zinc-500">
                    <SearchX className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">Nothing fits between {formatMoney(result.params.min)} and {formatMoney(result.params.max)}</h2>
                  <p className="mx-auto mt-1 max-w-md text-[13px] text-zinc-400">{result.note || "Try one of these. Each one re-runs the search right away."}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const mid = (Number(params.min) + Number(params.max)) / 2
                        recover({ min: String(+(mid * 0.9).toFixed(2)), max: String(+(mid * 1.1).toFixed(2)) })
                      }}
                    >
                      Widen to ±10%
                    </button>
                    {params.maxItems < 4 && (
                      <button className="btn-secondary" onClick={() => recover({ minItems: 1, maxItems: 4 })}>
                        Allow up to 4 items
                      </button>
                    )}
                    {(params.inStockOnly || params.distinctCategory || params.mustInclude.length > 0 || params.exclude.length > 0) && (
                      <button className="btn-secondary" onClick={() => recover({ inStockOnly: false, distinctCategory: false, mustInclude: [], exclude: [] })}>
                        Turn off rules
                      </button>
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          <Footer />
        </main>
      </div>

      <BottomNav steps={steps} active={active} onNavigate={navigate} />

      {/* Toasts: above the tab bar on phones, bottom-right on desktop */}
      <div className="pointer-events-none fixed inset-x-3 bottom-20 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end lg:bottom-6 print-hide" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} type={t.type} message={t.message} action={t.action} onClose={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMapper && parsed && (
          <ColumnMapper
            parsed={parsed}
            sheetIndex={sheetIndex}
            onSheetChange={(i) => openMapper(parsed, i)}
            mapping={mapping}
            confidence={confidence}
            onMappingChange={(m) => {
              setMapping(m)
              setConfidence({})
            }}
            onConfirm={confirmMapping}
            onCancel={() => setShowMapper(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{paletteOpen && <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{shortcutsOpen && <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{profileOpen && <DeveloperProfile onClose={() => setProfileOpen(false)} />}</AnimatePresence>
      <AnimatePresence>
        {confirmClear && (
          <ConfirmDialog
            title="Remove this catalogue?"
            message={`${source.fileName} and its results will be cleared from this page and from saved sessions. The original file on your computer is not touched.`}
            confirmLabel="Remove catalogue"
            onConfirm={clearCatalogue}
            onClose={() => setConfirmClear(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function compact(n) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n)
}
