import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui'
import { displayStatus } from './planData'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const keyOf = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const KIND_STYLES = {
  task: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  overdue: 'border-danger/40 bg-danger-soft text-danger',
  done: 'border-line bg-paper text-ink-soft line-through',
  milestone: 'border-accent/40 bg-accent-soft text-accent',
  meeting: 'border-violet-400/40 bg-violet-400/10 text-violet-200',
  review: 'border-warning/40 bg-warning-soft text-warning',
}

function PlanCalendar({ milestones, tasks, events }) {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState(() => keyOf(new Date()))

  const items = useMemo(() => {
    const map = {}
    const add = (iso, item) => {
      const k = keyOf(new Date(iso))
      ;(map[k] = map[k] || []).push(item)
    }
    tasks.forEach((t) => {
      const status = displayStatus(t)
      add(t.dueDate, { id: t.id, label: t.title, to: `/grc-plan/tasks/${t.id}`, kind: t.status === 'completed' ? 'done' : status === 'overdue' ? 'overdue' : 'task', meta: `${t.id} · ${t.owner}` })
    })
    milestones.forEach((m) => add(m.dueDate, { id: m.id, label: m.title, to: '/grc-plan?tab=milestones', kind: 'milestone', meta: `Milestone · ${m.owner}` }))
    events.forEach((e) => add(e.date, { id: e.id, label: e.title, kind: e.type, meta: e.type === 'meeting' ? 'Meeting' : 'Review' }))
    return map
  }, [tasks, milestones, events])

  const offset = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day >= 1 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null
  })
  const todayKey = keyOf(new Date())
  const selectedItems = items[selected] || []
  const shift = (n) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_20rem]">
      <div className="rounded-xl border border-line bg-paper-dark">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex gap-1.5">
            <Button variant="secondary" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="secondary" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelected(todayKey) }}>Today</Button>
            <Button variant="secondary" onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-line text-center text-[11px] uppercase tracking-wide text-ink-soft">
          {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-16 border-b border-r border-line bg-paper/30 sm:min-h-24" />
            const k = keyOf(date)
            const dayItems = items[k] || []
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(k)}
                className={`min-h-16 border-b border-r border-line p-1.5 text-left align-top hover:bg-paper cursor-pointer sm:min-h-24 ${selected === k ? 'bg-accent-soft/50' : ''}`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${k === todayKey ? 'bg-accent text-[#07111f]' : 'text-ink-soft'}`}>{date.getDate()}</span>
                <span className="mt-1 hidden space-y-1 sm:block">
                  {dayItems.slice(0, 2).map((item) => (
                    <span key={item.id} className={`block truncate rounded border px-1.5 py-0.5 text-[10px] ${KIND_STYLES[item.kind]}`}>{item.label}</span>
                  ))}
                  {dayItems.length > 2 && <span className="block px-1 text-[10px] text-ink-soft">+{dayItems.length - 2} more</span>}
                </span>
                {dayItems.length > 0 && <span className="mt-1 flex gap-0.5 sm:hidden">{dayItems.slice(0, 3).map((item) => <span key={item.id} className="h-1.5 w-1.5 rounded-full bg-accent" />)}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-fit rounded-xl border border-line bg-paper-dark p-5">
        <h3 className="text-sm font-semibold text-ink">
          {(() => {
            const [y, m, d] = selected.split('-').map(Number)
            return new Date(y, m, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
          })()}
        </h3>
        {selectedItems.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Nothing scheduled.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {selectedItems.map((item) => {
              const body = (
                <>
                  <span className="block text-sm">{item.label}</span>
                  <span className="text-xs opacity-80">{item.meta}</span>
                </>
              )
              return (
                <li key={item.id}>
                  {item.to ? (
                    <Link to={item.to} className={`block rounded-lg border px-3 py-2 hover:opacity-90 ${KIND_STYLES[item.kind]}`}>{body}</Link>
                  ) : (
                    <div className={`rounded-lg border px-3 py-2 ${KIND_STYLES[item.kind]}`}>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4 text-[11px]">
          {[['task', 'Task due'], ['overdue', 'Overdue'], ['milestone', 'Milestone'], ['meeting', 'Meeting'], ['review', 'Review']].map(([k, l]) => (
            <span key={k} className={`rounded border px-1.5 py-0.5 ${KIND_STYLES[k]}`}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlanCalendar
