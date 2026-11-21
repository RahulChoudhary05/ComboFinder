import { useEffect, useRef, useState } from "react"
import { Download, Mail, Loader2, ChevronDown } from "lucide-react"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** One "Download" menu + one "Email" action – fewer buttons, same capability. */
export default function ExportBar({ onExport, onEmail, busy }) {
  const [menu, setMenu] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)
  const menuRef = useRef(null)
  const valid = EMAIL_RE.test(email.trim())
  const showError = touched && email && !valid

  useEffect(() => {
    if (!menu) return
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false)
    const esc = (e) => e.key === "Escape" && setMenu(false)
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", esc)
    }
  }, [menu])

  const items = [
    ["xlsx", "Excel workbook", ".xlsx · summary, combos, line items"],
    ["csv", "CSV", ".csv · one row per result"],
    ["json", "JSON", ".json · for developers"],
    ["print", "Print", "or save as PDF"],
  ]

  return (
    <div className="w-full sm:w-auto print-hide">
      <div className="flex gap-2">
        <div ref={menuRef} className="relative flex-1 sm:flex-none">
          <button className="btn-primary w-full" onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} disabled={!!busy && busy !== "email"}>
            {busy === "xlsx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
          {menu && (
            <div role="menu" className="glass absolute right-0 z-30 mt-1.5 w-64 rounded-lg p-1 shadow-xl shadow-black/50">
              {items.map(([k, label, sub]) => (
                <button
                  key={k}
                  role="menuitem"
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-white/[0.06]"
                  onClick={() => {
                    setMenu(false)
                    k === "print" ? window.print() : onExport(k)
                  }}
                >
                  <span className="text-[13px] text-zinc-100">{label}</span>
                  <span className="text-[12px] text-zinc-500">{sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-secondary flex-1 sm:flex-none" aria-expanded={showEmail} onClick={() => setShowEmail(!showEmail)}>
          <Mail className="h-4 w-4" /> Email
        </button>
      </div>

      {showEmail && (
        <form
          noValidate
          className="mt-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setTouched(true)
            if (valid && (await onEmail(email.trim()))) {
              setEmail("")
              setTouched(false)
              setShowEmail(false)
            }
          }}
        >
          <div className="flex gap-2">
            <input
              type="email"
              className={`input ${showError ? "input-error" : ""}`}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-label="Email address"
              aria-invalid={showError || undefined}
              autoFocus
            />
            <button type="submit" className="btn-primary shrink-0" disabled={busy === "email"}>
              {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </button>
          </div>
          <p className={`mt-1 text-[12px] ${showError ? "text-red-300" : "text-zinc-500"}`}>{showError ? "Please check the email address." : "We’ll send the top 200 results with a CSV attached."}</p>
        </form>
      )}
    </div>
  )
}
