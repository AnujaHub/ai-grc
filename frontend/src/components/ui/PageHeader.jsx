import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-soft">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-accent">{item.label}</Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={`truncate ${last ? 'max-w-[16rem] text-ink' : ''}`}>{item.label}</span>
              )}
              {!last && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function PageHeader({ eyebrow, title, subtitle, actions, back, badge, breadcrumbs, crumb }) {
  const trail = breadcrumbs || [
    { label: 'Overview', to: '/dashboard' },
    ...(back ? [{ label: back.label, to: back.to }] : []),
    { label: crumb || title },
  ]

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Breadcrumbs items={trail} />
        {eyebrow && <p className="mb-1.5 font-mono text-xs text-accent">{eyebrow}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export default PageHeader
