import { motion } from "framer-motion"
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react"

const STYLES = {
  error: "text-rose-300",
  success: "text-accent",
  info: "text-zinc-300",
}
const ICONS = { error: AlertCircle, success: CheckCircle2, info: Info }

export default function Toast({ type = "info", message, action, onClose }) {
  const Icon = ICONS[type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.15 } }}
      role={type === "error" ? "alert" : "status"}
      className="glass pointer-events-auto flex w-full items-center gap-3 rounded-2xl p-3 pl-4 text-[13px] text-zinc-200 shadow-2xl shadow-black/50 sm:w-[380px]"
    >
      <Icon className={`h-4 w-4 shrink-0 ${STYLES[type]}`} />
      <p className="flex-1 leading-snug">{message}</p>
      {action && (
        <button
          onClick={() => {
            action.onClick()
            onClose()
          }}
          className="btn-secondary h-8 px-3 text-[12px]"
        >
          {action.label}
        </button>
      )}
      <button onClick={onClose} className="btn-ghost h-8 w-8 px-0" aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
