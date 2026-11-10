import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellRing, X } from 'lucide-react'
import { REMINDER_DAYS, dueLabel, dueTone } from '../dashboard/utils/format'
import { getCurrentUser, getFullName } from '../../utils/roles'
import { getReminders } from './remindersData'

const LEVEL_DOT = { overdue: 'bg-danger', today: 'bg-warning', soon: 'bg-warning/60' }

function RemindersBell({ placement = 'sidebar' }) {
  const [items, setItems] = useState(null)
  const [open, setOpen] = useState(false)
  const [mineOnly, setMineOnly] = useState(false)
  const panelRef = useRef(null)
  const me = getFullName(getCurrentUser())

  useEffect(() => {
    let active = true
    getReminders().then((list) => active && setItems(list))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onClick = (e) => panelRef.current && !panelRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const visible = (items || []).filter((i) => !mineOnly || i.owner === me)
  const overdue = (items || []).filter((i) => i.level === 'overdue').length
  const count = items?.length || 0

  const position = placement === 'sidebar'
    ? 'fixed left-[17rem] top-4 w-[26rem] max-h-[80vh]'
    : 'fixed inset-x-2 top-[4.5rem] max-h-[75vh]'

  return (
    <div ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Reminders: ${count} due within ${REMINDER_DAYS} days`}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-ink-soft hover:bg-paper-dark hover:text-accent cursor-pointer"
      >
        {count ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {count > 0 && (
          <span className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold text-white ${overdue ? 'bg-danger' : 'bg-warning'}`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Reminders" className={`${position} z-50 flex flex-col rounded-xl border border-line bg-paper-dark shadow-2xl`}>
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Reminders</p>
              <p className="text-xs text-ink-soft">Shown from {REMINDER_DAYS} days before each due date</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-ink-soft hover:text-ink cursor-pointer" aria-label="Close reminders">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs">
            <span className="text-ink-soft">
              <span className="font-mono text-danger">{overdue}</span> overdue · <span className="font-mono text-warning">{count - overdue}</span> due soon
            </span>
            <div className="inline-flex rounded-lg border border-line bg-paper p-0.5">
              {[{ v: false, l: 'All' }, { v: true, l: 'Mine' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => setMineOnly(v)}
                  className={`rounded-md px-2 py-0.5 cursor-pointer ${mineOnly === v ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items === null ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">
                {mineOnly ? 'Nothing assigned to you is due in the next 10 days.' : 'Nothing is due in the next 10 days.'}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((item) => (
                  <li key={item.id}>
                    <Link to={item.to} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-paper">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[item.level]}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{item.title}</span>
                        <span className="block text-xs text-ink-soft">
                          {item.kind} · <span className="font-mono">{item.ref}</span> · {item.owner}
                        </span>
                      </span>
                      <span className={`shrink-0 text-right text-xs ${dueTone(item.dueDate)}`}>
                        {item.kind === 'Evidence expiry' ? dueLabel(item.dueDate).replace('Due', 'Expires').replace('Overdue by', 'Expired') : dueLabel(item.dueDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-between border-t border-line px-4 py-2.5 text-xs">
            <Link to="/notifications" onClick={() => setOpen(false)} className="font-medium text-accent hover:underline">Notification centre</Link>
            <Link to="/notifications?tab=preferences" onClick={() => setOpen(false)} className="text-ink-soft hover:text-ink">Preferences</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemindersBell
