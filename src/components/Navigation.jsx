import { Search, Check } from "lucide-react"
import { Avatar } from "./DeveloperProfile"
import { DEVELOPER } from "../config"
import { modKey } from "../lib/hooks"

/** steps: [{ id, label, icon, status: "done"|"ready"|"idle", meta?, disabled? }] */
export function Sidebar({ steps, active, onNavigate, onOpenPalette, onOpenShortcuts, onOpenProfile }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/[0.08] bg-ink-950 lg:flex print-hide" aria-label="Sidebar">
      <a href="/" className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" />
        <span className="text-[15px] font-semibold tracking-tight text-zinc-50">ComboFinder</span>
      </a>

      <nav className="flex-1 px-3" aria-label="Steps">
        <ol className="space-y-0.5">
          {steps.map((s, i) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => onNavigate(s.id)}
                  disabled={s.disabled}
                  aria-current={isActive ? "step" : undefined}
                  className={`relative flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isActive ? "bg-white/[0.07] font-medium text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                  }`}
                >
                  {isActive && <span aria-hidden className="absolute -left-3 top-2 h-5 w-[3px] rounded-r bg-accent" />}
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                      s.status === "done" ? "border-accent/50 bg-accent/10 text-accent" : isActive ? "border-zinc-300 text-zinc-200" : "border-white/15 text-zinc-500"
                    }`}
                  >
                    {s.status === "done" ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="flex-1">{s.label}</span>
                  {s.meta && <span className="num text-[11px] text-zinc-500">{s.meta}</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="space-y-1 p-3">
        <button onClick={onOpenPalette} className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-[13px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200">
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Quick actions</span>
          <span className="font-mono text-[11px]">{modKey} K</span>
        </button>
        <button onClick={onOpenShortcuts} className="flex h-9 w-full items-center rounded-md px-2.5 text-[13px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200">
          Keyboard shortcuts
        </button>
        <div className="divider !my-2" />
        <button onClick={onOpenProfile} className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-white/[0.04]">
          <Avatar className="h-8 w-8 rounded-full" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] text-zinc-200">{DEVELOPER.name}</span>
            <span className="block text-[11px] text-zinc-500">About the developer</span>
          </span>
        </button>
      </div>
    </aside>
  )
}

export function MobileTopBar({ onOpenPalette, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-ink-950/95 px-4 backdrop-blur lg:hidden print-hide">
      <a href="/" className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" />
        <span className="text-[15px] font-semibold tracking-tight text-zinc-50">ComboFinder</span>
      </a>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={onOpenPalette} className="btn-ghost h-10 w-10 px-0" aria-label="Quick actions">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button onClick={onOpenProfile} className="grid h-10 w-10 place-items-center" aria-label="About the developer">
          <Avatar className="h-8 w-8 rounded-full" />
        </button>
      </div>
    </header>
  )
}

export function BottomNav({ steps, active, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-950/95 backdrop-blur lg:hidden print-hide" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Steps">
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {steps.map((s) => {
          const Icon = s.icon
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <button
                onClick={() => onNavigate(s.id)}
                disabled={s.disabled}
                aria-current={isActive ? "step" : undefined}
                className={`flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors disabled:opacity-35 ${isActive ? "text-accent" : "text-zinc-500"}`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                  {s.status === "done" && <span className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />}
                </span>
                {s.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
