import { CalendarDays } from 'lucide-react'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardHeader({ roleLabel, title, subtitle, actions }) {
  const user = JSON.parse(localStorage.getItem('utilisateur') || 'null')
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 font-mono text-accent">{roleLabel}</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {today}
          </span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {title || `${greeting()}${user?.prenom ? `, ${user.prenom}` : ''}`}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export default DashboardHeader
