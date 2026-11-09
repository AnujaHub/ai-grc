const Block = ({ className }) => <div className={`animate-pulse rounded-xl border border-line bg-paper-dark ${className}`} />

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-paper-dark" />
        <div className="h-8 w-72 animate-pulse rounded bg-paper-dark" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Block key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Block className="h-72 lg:col-span-2" />
        <Block className="h-72" />
      </div>
    </div>
  )
}

export default DashboardSkeleton
