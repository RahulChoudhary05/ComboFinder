import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

/**
 * Reusable data table.
 *
 * columns: [{ id, header, cell: (row) => node, sortValue?: (row) => number|string, align?: "right",
 *             className?, headClassName?, hideBelow?: "sm"|"md"|"lg" }]
 * Selection is controlled by the parent (Set of row ids) so bulk actions live outside the table.
 * On phones, `renderCard` replaces the table with stacked cards (no horizontal scrolling).
 */
export default function DataTable({
  rows,
  columns,
  getRowId,
  selectable = false,
  selected,
  onSelectedChange,
  renderExpanded,
  renderCard,
  rowClassName,
  initialSort = null,
  pageSizes = [25, 50, 100],
  emptyState = null,
  caption,
}) {
  const [sort, setSort] = useState(initialSort) // { id, dir: "asc" | "desc" }
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(pageSizes[0])
  const [open, setOpen] = useState(() => new Set())

  useEffect(() => setPage(0), [rows, sort, pageSize])

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortValue) return rows
    const dir = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = col.sortValue(a), y = col.sortValue(b)
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * dir
    })
  }, [rows, sort, columns])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pages - 1)
  const slice = sorted.slice(current * pageSize, current * pageSize + pageSize)
  const pageIds = slice.map(getRowId)
  const allOnPage = selectable && pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someOnPage = selectable && pageIds.some((id) => selected.has(id))

  const headerBox = useRef(null)
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage
  }, [someOnPage, allOnPage])

  const toggleRow = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectedChange(next)
  }
  const togglePage = () => {
    const next = new Set(selected)
    if (allOnPage) pageIds.forEach((id) => next.delete(id))
    else pageIds.forEach((id) => next.add(id))
    onSelectedChange(next)
  }
  const toggleOpen = (id) =>
    setOpen((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const cycleSort = (id) =>
    setSort((s) => (!s || s.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null))

  const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" }

  if (!rows.length) return emptyState

  return (
    <div>
      {/* Phone: cards */}
      {renderCard && (
        <ul className="space-y-2 md:hidden">
          {slice.map((row) => {
            const id = getRowId(row)
            return (
              <li key={id}>
                {renderCard(row, {
                  selected: selectable && selected.has(id),
                  toggleSelected: () => toggleRow(id),
                  expanded: open.has(id),
                  toggleExpanded: () => toggleOpen(id),
                })}
              </li>
            )
          })}
        </ul>
      )}

      {/* Tablet & desktop: table */}
      <div className={`${renderCard ? "hidden md:block" : ""} overflow-x-auto rounded-2xl border border-white/[0.07] print-expand`}>
        <table className="min-w-full text-[13px]">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-10 bg-ink-850/95 text-left text-[11px] uppercase tracking-wider text-zinc-500 backdrop-blur">
            <tr>
              {selectable && (
                <th className="w-10 py-3 pl-4 pr-2 print-hide">
                  <input ref={headerBox} type="checkbox" className="checkbox" checked={allOnPage} onChange={togglePage} aria-label="Select all rows on this page" />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.id === c.id
                const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={`px-3 py-3 font-medium ${c.align === "right" ? "text-right" : ""} ${c.hideBelow ? hide[c.hideBelow] : ""} ${c.headClassName || ""}`}
                  >
                    {c.sortValue ? (
                      <button onClick={() => cycleSort(c.id)} className={`inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-zinc-200 ${active ? "text-zinc-200" : ""}`}>
                        {c.header}
                        <Icon className="h-3 w-3" />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
              {renderExpanded && <th className="w-10 print-hide" aria-label="Details" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {slice.map((row) => {
              const id = getRowId(row)
              const isSel = selectable && selected.has(id)
              const isOpen = open.has(id)
              return (
                <Fragment key={id}>
                  <tr className={`align-top transition-colors ${isSel ? "bg-white/[0.04]" : "hover:bg-white/[0.025]"} ${rowClassName ? rowClassName(row) : ""}`}>
                    {selectable && (
                      <td className="py-3 pl-4 pr-2 print-hide">
                        <input type="checkbox" className="checkbox mt-0.5" checked={isSel} onChange={() => toggleRow(id)} aria-label="Select row" />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.id} className={`px-3 py-3 ${c.align === "right" ? "text-right" : ""} ${c.hideBelow ? hide[c.hideBelow] : ""} ${c.className || ""}`}>
                        {c.cell(row)}
                      </td>
                    ))}
                    {renderExpanded && (
                      <td className="py-2.5 pr-3 print-hide">
                        <button onClick={() => toggleOpen(id)} className="btn-ghost h-8 w-8 px-0" aria-expanded={isOpen} aria-label="Toggle details">
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    )}
                  </tr>
                  {renderExpanded && isOpen && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={columns.length + (selectable ? 2 : 1)} className="px-4 pb-4 pt-1">
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-zinc-500 print-hide">
        <div className="flex items-center gap-2">
          <span className="num">
            {(current * pageSize + 1).toLocaleString()}–{Math.min(sorted.length, (current + 1) * pageSize).toLocaleString()} of {sorted.length.toLocaleString()}
          </span>
          <select className="input h-8 w-auto py-0 text-[12px]" value={pageSize} onChange={(e) => setPageSize(+e.target.value)} aria-label="Rows per page">
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
        {pages > 1 && (
          <div className="flex items-center gap-1">
            <button className="btn-secondary h-9 w-9 px-0" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="num px-2">
              {current + 1} / {pages}
            </span>
            <button className="btn-secondary h-9 w-9 px-0" onClick={() => setPage(current + 1)} disabled={current >= pages - 1} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
