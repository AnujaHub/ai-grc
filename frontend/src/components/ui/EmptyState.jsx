import { Inbox } from 'lucide-react'

function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper text-ink-soft">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
