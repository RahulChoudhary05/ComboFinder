import { ArrowLeft } from "lucide-react"
import Background from "./Background"

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center p-6">
      <Background />
      <div className="text-center">
        <p className="num text-zinc-100 text-[clamp(5rem,22vw,11rem)] font-bold leading-none tracking-tighter">404</p>
        <h1 className="mt-2 text-xl font-semibold">This combo doesn’t exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-zinc-400">
          We searched every bundle of pages and none of them add up to <span className="num text-zinc-300">{window.location.pathname}</span>.
        </p>
        <a href="/" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to ComboFinder
        </a>
      </div>
    </div>
  )
}
