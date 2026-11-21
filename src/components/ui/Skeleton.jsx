export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />
}

export function InsightsSkeleton() {
  return (
    <div className="card" aria-busy="true" aria-label="Loading insights">
      <Skeleton className="h-5 w-40" />
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[76px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-5 h-28 rounded-xl" />
    </div>
  )
}

export function ResultsSkeleton({ rows = 6 }) {
  return (
    <div className="card" aria-busy="true" aria-label="Searching">
      <Skeleton className="h-6 w-72 max-w-full" />
      <div className="mt-2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.05] p-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
