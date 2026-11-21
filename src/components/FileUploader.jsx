import { useRef, useState } from "react"
import { Upload, Loader2, FileCheck2, X } from "lucide-react"
import { ACCEPT, MAX_FILE_BYTES } from "../lib/parse"
import { sampleCSV, sampleJSON, sampleXLSX } from "../lib/samples"
import { downloadBlob } from "../lib/exporters"

export default function FileUploader({ inputRef, onFile, onTrySample, busy, onError, loaded, onRemap, onClear }) {
  const [dragging, setDragging] = useState(false)
  const localRef = useRef(null)
  const ref = inputRef || localRef

  const take = (file) => {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) return onError(`That file is larger than ${MAX_FILE_BYTES / 1048576} MB.`)
    onFile(file)
  }

  const samples = [
    ["CSV", () => downloadBlob(sampleCSV(), "combofinder-sample.csv", "text/csv;charset=utf-8")],
    ["Excel", async () => downloadBlob(await sampleXLSX(), "combofinder-sample.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")],
    ["JSON", () => downloadBlob(sampleJSON(), "combofinder-sample.json", "application/json")],
  ]

  return (
    <div>
      {loaded && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5">
          <FileCheck2 className="h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-zinc-100" title={loaded.fileName}>
              {loaded.fileName}
            </p>
            <p className="text-[12px] text-zinc-500">
              {loaded.count.toLocaleString()} products{loaded.sheetName ? ` · ${loaded.sheetName}` : ""} ·{" "}
              <button onClick={onRemap} className="text-zinc-300 underline decoration-white/20 underline-offset-2 hover:decoration-white/60">
                edit columns
              </button>
            </p>
          </div>
          <button onClick={onClear} className="btn-ghost h-9 w-9 px-0" aria-label="Remove catalogue" title="Remove">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a product file"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ref.current?.click())}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          take(e.dataTransfer.files?.[0])
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center transition-colors ${loaded ? "py-5" : "py-10"} ${
          dragging ? "border-zinc-300 bg-white/[0.04]" : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            <p className="mt-3 text-[13px] text-zinc-400">Reading file…</p>
          </>
        ) : (
          <>
            {!loaded && <Upload className="mb-3 h-5 w-5 text-zinc-400" />}
            <p className="text-[14px] text-zinc-200">{loaded ? "Drop another file to replace it" : "Drop your product file here"}</p>
            <p className="mt-1 text-[13px] text-zinc-500">
              or <span className="text-zinc-200 underline decoration-white/30 underline-offset-2">choose a file</span>
              {!loaded && " · Excel, CSV, ODS or JSON"}
            </p>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            take(e.target.files?.[0])
            e.target.value = ""
          }}
        />
      </div>

      {!loaded && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px]">
          <button onClick={onTrySample} disabled={busy} className="font-medium text-zinc-100 underline decoration-white/30 underline-offset-4 hover:decoration-white">
            Try it with sample data
          </button>
          <span className="text-zinc-500">
            Sample file:{" "}
            {samples.map(([label, run], i) => (
              <span key={label}>
                <button onClick={run} className="text-zinc-300 hover:text-white">
                  {label}
                </button>
                {i < samples.length - 1 && " · "}
              </span>
            ))}
          </span>
        </div>
      )}
      <p className="mt-3 text-[12px] text-zinc-600">Up to {MAX_FILE_BYTES / 1048576} MB. Your file is read on this device and never uploaded.</p>
    </div>
  )
}
