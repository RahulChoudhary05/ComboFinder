import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { X } from "lucide-react"

/**
 * Accessible modal: Esc to close, focus moves in and is restored on close, Tab is trapped,
 * body scroll is locked. Renders as a bottom sheet on phones and a centred panel from `sm` up.
 * Wrap in <AnimatePresence> for exit animations.
 */
export default function Dialog({ onClose, title, description, children, size = "md", align = "center", hideClose, labelledBy }) {
  const panel = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusables = () => panel.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || []
    requestAnimationFrame(() => {
      const auto = panel.current?.querySelector("[data-autofocus]")
      ;(auto || focusables()[0] || panel.current)?.focus()
    })
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      } else if (e.key === "Tab") {
        const f = [...focusables()]
        if (!f.length) return
        const first = f[0], last = f.at(-1)
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => {
      window.removeEventListener("keydown", onKey, true)
      document.body.style.overflow = prevOverflow
      prev?.focus?.()
    }
  }, [onClose])

  const widths = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex min-h-full justify-center sm:p-6 ${align === "top" ? "items-end sm:items-start sm:pt-[12vh]" : "items-end sm:items-center"}`}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy || (title ? "dlg-title" : undefined)}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={`glass relative w-full ${widths[size]} max-h-[92dvh] overflow-hidden rounded-t-3xl shadow-2xl shadow-black/60 outline-none sm:rounded-2xl`}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
          {(title || !hideClose) && (
            <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4">
              <div>
                {title && (
                  <h2 id="dlg-title" className="text-base font-semibold tracking-tight">
                    {title}
                  </h2>
                )}
                {description && <p className="mt-0.5 text-[13px] text-zinc-400">{description}</p>}
              </div>
              {!hideClose && (
                <button onClick={onClose} className="btn-ghost -mr-2 -mt-1 h-8 w-8 px-0" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  )
}
