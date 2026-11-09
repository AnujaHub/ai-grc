import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function SectionCard({ title, subtitle, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`flex flex-col rounded-xl border border-line bg-paper-dark ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
        </div>
        {action && (
          <Link to={action.to} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent hover:underline">
            {action.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className={`flex-1 p-5 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export default SectionCard
