import { Component } from "react"
import { RotateCcw, Trash2, Bug } from "lucide-react"
import { storage } from "../lib/hooks"

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("ComboFinder crashed:", error, info?.componentStack)
  }

  reset = () => this.setState({ error: null })

  resetSession = () => {
    storage.remove("cf:v2:session")
    storage.remove("cf:v2:settings")
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-ink-950 p-6 text-zinc-300">
        <div className="surface w-full max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
            <Bug className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Something went wrong</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            The page hit an unexpected error. Your file never left your browser. Try again, or reset the saved session if
            the problem keeps coming back.
          </p>
          <pre className="mt-4 max-h-24 overflow-auto rounded-xl bg-black/40 p-3 text-left text-[11px] text-rose-200/80">{String(this.state.error?.message || this.state.error)}</pre>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="btn-primary" onClick={this.reset}>
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            <button className="btn-secondary" onClick={this.resetSession}>
              <Trash2 className="h-4 w-4" /> Reset saved session
            </button>
          </div>
        </div>
      </div>
    )
  }
}
