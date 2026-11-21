import { Check, Wand2, Sheet, AlertTriangle } from "lucide-react"
import { ROLES } from "../lib/columns"
import Dialog from "./ui/Dialog"

const roleOf = (mapping, index) => Object.keys(mapping).find((r) => mapping[r] === index)

export default function ColumnMapper({ parsed, sheetIndex, onSheetChange, mapping, confidence, onMappingChange, onConfirm, onCancel }) {
  const sheet = parsed.sheets[sheetIndex]
  const ok = mapping.name !== undefined && mapping.price !== undefined

  const assign = (index, role) => {
    const next = { ...mapping }
    const current = roleOf(next, index)
    if (current) delete next[current]
    if (role) next[role] = index
    onMappingChange(next)
  }
  const preview = sheet.rows.slice(0, 8)

  return (
    <Dialog
      onClose={onCancel}
      size="xl"
      title="Map your columns"
      description={`${parsed.fileName} · ${sheet.rows.length.toLocaleString()} rows · ${sheet.headers.length} columns${sheet.headerRow > 0 ? ` · header on row ${sheet.headerRow + 1}` : ""}`}
    >
      <div className="max-h-[calc(92dvh-150px)] space-y-4 overflow-y-auto px-5 pb-4 pt-3">
        {parsed.sheets.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] text-zinc-500">
              <Sheet className="h-3.5 w-3.5" /> Sheet
            </span>
            <div className="segmented flex-wrap">
              {parsed.sheets.map((s, i) => (
                <button key={s.name + i} aria-pressed={i === sheetIndex} onClick={() => onSheetChange(i)}>
                  {s.name} <span className="num text-zinc-500">{s.rows.length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => {
            const idx = mapping[r.id]
            const set = idx !== undefined
            return (
              <span key={r.id} className={`chip ${!set && r.required ? "border-red-400/40 text-red-300" : !set ? "border-dashed text-zinc-500" : ""}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${set ? r.color : "bg-zinc-600"}`} />
                {r.label}
                {set && <span className="text-zinc-500">→</span>}
                {set && <span className="max-w-[120px] truncate text-zinc-100">{sheet.headers[idx]}</span>}
                {set && confidence[r.id] !== undefined && (
                  <span className="num flex items-center gap-0.5 text-[10px] text-zinc-500" title="Auto-detection confidence">
                    <Wand2 className="h-2.5 w-2.5" />
                    {Math.round(confidence[r.id] * 100)}%
                  </span>
                )}
                {!set && r.required && <span className="text-[10px]">required</span>}
              </span>
            )
          })}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="min-w-full text-[13px]">
            <thead className="bg-white/[0.03]">
              <tr>
                {sheet.headers.map((h, i) => {
                  const role = roleOf(mapping, i)
                  const meta = ROLES.find((r) => r.id === role)
                  return (
                    <th key={h + i} className="min-w-[150px] border-b border-white/[0.07] p-2 text-left align-top font-medium">
                      <div className="mb-1.5 flex items-center gap-1.5 truncate text-zinc-200" title={h}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta ? meta.color : "bg-zinc-600"}`} />
                        {h}
                      </div>
                      <select value={role || ""} onChange={(e) => assign(i, e.target.value)} className={`input h-8 text-[12px] ${role ? "border-white/25" : ""}`} aria-label={`Role for column ${h}`}>
                        <option value="">Extra info</option>
                        {ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {preview.map((row, ri) => (
                <tr key={ri} className="text-zinc-400">
                  {sheet.headers.map((h, ci) => (
                    <td key={ci} className="max-w-[220px] truncate px-3 py-2" title={String(row[ci] ?? "")}>
                      {String(row[ci] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-zinc-500">
          First {preview.length} rows shown. Columns left as <em>Extra info</em> are kept in results and exports.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        {!ok ? (
          <p className="flex items-center gap-1.5 text-[13px] text-rose-300">
            <AlertTriangle className="h-4 w-4" /> Choose a name column and a price column.
          </p>
        ) : (
          <p className="hidden text-[12px] text-zinc-500 sm:block">You can change this any time from the catalogue card.</p>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 sm:flex-none">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!ok} className="btn-primary flex-1 sm:flex-none" data-autofocus>
            <Check className="h-4 w-4" /> Load {sheet.rows.length.toLocaleString()} rows
          </button>
        </div>
      </div>
    </Dialog>
  )
}
