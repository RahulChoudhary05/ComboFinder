import { useMemo, useRef, useState, useEffect } from "react"
import { Search, CornerDownLeft } from "lucide-react"
import Dialog from "./Dialog"

/** Subsequence fuzzy score: higher is better, -1 = no match. Rewards consecutive and word-start hits. */
export function fuzzyScore(query, text) {
  const q = query.toLowerCase().trim()
  if (!q) return 0
  const t = text.toLowerCase()
  if (t.includes(q)) return 100 - t.indexOf(q)
  let score = 0, ti = 0, streak = 0
  for (const ch of q) {
    const found = t.indexOf(ch, ti)
    if (found === -1) return -1
    streak = found === ti ? streak + 1 : 0
    score += 1 + streak * 2 + (found === 0 || t[found - 1] === " " ? 3 : 0)
    ti = found + 1
  }
  return score
}

/**
 * commands: [{ id, group, label, icon, hint?, keywords?, disabled?, run }]
 */
export default function CommandPalette({ commands, onClose }) {
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)
  const listRef = useRef(null)

  const results = useMemo(() => {
    const enabled = commands.filter((c) => !c.disabled)
    if (!query.trim()) return enabled
    return enabled
      .map((c) => ({ c, s: fuzzyScore(query, `${c.label} ${c.group} ${c.keywords || ""}`) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c)
  }, [commands, query])

  useEffect(() => setIndex(0), [query])
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${index}"]`)?.scrollIntoView({ block: "nearest" })
  }, [index])

  const run = (cmd) => {
    if (!cmd) return
    onClose()
    // Let the palette close (and restore focus) before running – some commands open other dialogs.
    setTimeout(() => cmd.run(), 60)
  }

  // Group while preserving rank order
  const groups = []
  results.forEach((c, i) => {
    const g = query.trim() ? "Results" : c.group
    let bucket = groups.find((x) => x.name === g)
    if (!bucket) groups.push((bucket = { name: g, items: [] }))
    bucket.items.push({ c, i })
  })

  return (
    <Dialog onClose={onClose} hideClose size="md" align="top" labelledBy="cmdk-label">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
        <Search className="h-4 w-4 shrink-0 text-zinc-500" />
        <label id="cmdk-label" className="sr-only">
          Search commands
        </label>
        <input
          data-autofocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setIndex((i) => Math.min(results.length - 1, i + 1)))
            else if (e.key === "ArrowUp") (e.preventDefault(), setIndex((i) => Math.max(0, i - 1)))
            else if (e.key === "Enter") (e.preventDefault(), run(results[index]))
          }}
          placeholder="Type a command or search…"
          className="h-14 w-full bg-transparent text-[15px] text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
        />
        <kbd className="kbd hidden sm:inline-grid">Esc</kbd>
      </div>
      <div ref={listRef} id="cmdk-list" role="listbox" className="max-h-[min(60dvh,420px)] overflow-y-auto p-2">
        {results.length === 0 && <p className="px-3 py-10 text-center text-[13px] text-zinc-500">No commands match “{query}”.</p>}
        {groups.map((g) => (
          <div key={g.name} className="mb-1">
            <p className="eyebrow px-3 pb-1 pt-2">{g.name}</p>
            {g.items.map(({ c, i }) => {
              const Icon = c.icon
              const active = i === index
              return (
                <button
                  key={c.id}
                  id={`cmd-${c.id}`}
                  data-idx={i}
                  role="option"
                  aria-selected={active}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(c)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                    active ? "bg-white/[0.08] text-white" : "text-zinc-300"
                  }`}
                >
                  {Icon && <Icon className={`h-4 w-4 shrink-0 ${active ? "text-zinc-100" : "text-zinc-500"}`} />}
                  <span className="flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="text-[11px] text-zinc-500">{c.hint}</span>}
                  {active && <CornerDownLeft className="h-3.5 w-3.5 text-zinc-500" />}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="hidden items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-zinc-500 sm:flex">
        <span className="flex items-center gap-1">
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd> navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="kbd">↵</kbd> run
        </span>
        <span className="ml-auto">{results.length} commands</span>
      </div>
    </Dialog>
  )
}
