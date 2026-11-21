import { AlertTriangle } from "lucide-react"
import Dialog from "./Dialog"

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onClose, danger = true }) {
  return (
    <Dialog onClose={onClose} size="sm" hideClose>
      <div className="p-5 pt-3">
        <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${danger ? "bg-rose-500/15 text-rose-300" : "bg-white/10 text-zinc-200"}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 id="dlg-title" className="text-base font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{message}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-secondary" onClick={onClose} data-autofocus>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
