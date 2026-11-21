import Dialog from "./Dialog"
import { modKey } from "../../lib/hooks"

export const SHORTCUTS = [
  { group: "General", items: [[[modKey, "K"], "Open command palette"], [["?"], "Show keyboard shortcuts"], [["Esc"], "Close dialog / cancel search"]] },
  { group: "Data", items: [[["U"], "Upload a file"], [["S"], "Load sample data"], [["/"], "Filter results"]] },
  { group: "Search", items: [[[modKey, "↵"], "Run search"], [["E"], "Export results to Excel"]] },
  { group: "Navigate", items: [[["1"], "Catalogue"], [["2"], "Budget & rules"], [["3"], "Insights"], [["4"], "Results"]] },
]

export default function ShortcutsDialog({ onClose }) {
  return (
    <Dialog onClose={onClose} title="Keyboard shortcuts" description="Work faster without leaving the keyboard." size="md">
      <div className="grid gap-5 p-5 pt-3 sm:grid-cols-2">
        {SHORTCUTS.map((g) => (
          <div key={g.group}>
            <p className="eyebrow mb-2">{g.group}</p>
            <ul className="space-y-1.5">
              {g.items.map(([keys, label]) => (
                <li key={label} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-zinc-300">{label}</span>
                  <span className="flex gap-1">
                    {keys.map((k) => (
                      <kbd key={k} className="kbd">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
