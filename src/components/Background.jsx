// Plain near-black canvas. A single, very faint neutral light at the top gives depth without
// the "AI aurora" look (no coloured blobs, no animation).
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ink-950 print-hide">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(255,255,255,0.035),transparent)]" />
    </div>
  )
}
