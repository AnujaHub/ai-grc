import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bell, Settings2, CheckCheck, BadgeCheck, CalendarClock, FileCheck2, ListTodo, Sparkles, ShieldCheck, BellOff } from 'lucide-react'
import { Button, EmptyState, PageHeader, Tabs } from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'
import SectionCard from '../dashboard/components/SectionCard'
import { timeAgo } from '../dashboard/utils/format'
import { toast } from '../../utils/toast'
import { CATEGORIES, getPreferences, listNotifications, markRead, savePreferences } from './notificationsData'

const TYPE_STYLE = {
  approval: { Icon: BadgeCheck, cls: 'bg-warning-soft text-warning' },
  reminder: { Icon: CalendarClock, cls: 'bg-danger-soft text-danger' },
  evidence: { Icon: FileCheck2, cls: 'bg-accent-soft text-accent' },
  task: { Icon: ListTodo, cls: 'bg-sky-400/10 text-sky-300' },
  ai: { Icon: Sparkles, cls: 'bg-violet-400/10 text-violet-300' },
  system: { Icon: ShieldCheck, cls: 'bg-paper text-ink-soft' },
}

const dayGroup = (iso) => {
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return 'Earlier this week'
  return 'Older'
}

function Inbox() {
  const [items, setItems] = useState(null)
  const [type, setType] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)

  useEffect(() => {
    let active = true
    listNotifications().then((list) => active && setItems(list))
    return () => {
      active = false
    }
  }, [])

  const visible = useMemo(() => (items || []).filter((n) => (!type || n.type === type) && (!unreadOnly || !n.read)), [items, type, unreadOnly])
  const groups = useMemo(() => visible.reduce((acc, n) => {
    const g = dayGroup(n.at)
    ;(acc[g] = acc[g] || []).push(n)
    return acc
  }, {}), [visible])

  if (!items) return <DashboardSkeleton />
  const unread = items.filter((n) => !n.read).length

  const markAll = async () => {
    setItems(await markRead(items.filter((n) => !n.read).map((n) => n.id)))
    toast('All notifications marked as read.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper-dark p-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setType('')} className={`rounded-full border px-3 py-1 text-xs cursor-pointer ${!type ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-soft hover:text-ink'}`}>
            All <span className="font-mono">{items.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const n = items.filter((x) => x.type === c.id).length
            return (
              <button key={c.id} type="button" onClick={() => setType(c.id)} className={`rounded-full border px-3 py-1 text-xs cursor-pointer ${type === c.id ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-soft hover:text-ink'}`}>
                {c.label} <span className="font-mono">{n}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3 lg:ml-auto">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="h-4 w-4 accent-[#38d9c2]" />
            Unread only ({unread})
          </label>
          <Button variant="secondary" onClick={markAll} disabled={!unread}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-paper-dark"><EmptyState icon={BellOff} title="You're all caught up" message="No notifications match this filter." /></div>
      ) : (
        ['Today', 'Yesterday', 'Earlier this week', 'Older'].filter((g) => groups[g]).map((g) => (
          <section key={g}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{g}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper-dark">
              {groups[g].map((n) => {
                const { Icon, cls } = TYPE_STYLE[n.type]
                return (
                  <li key={n.id} className={n.read ? '' : 'bg-accent-soft/30'}>
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4" /></span>
                      <Link to={n.link} onClick={() => !n.read && markRead([n.id]).then(setItems)} className="min-w-0 flex-1">
                        <p className={`text-sm ${n.read ? 'text-ink' : 'font-semibold text-ink'}`}>{n.title}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>
                        <p className="mt-1 text-xs text-ink-soft/80">{CATEGORIES.find((c) => c.id === n.type)?.label} · {timeAgo(n.at)}</p>
                      </Link>
                      <button type="button" onClick={() => markRead([n.id], !n.read).then(setItems)} aria-label={n.read ? 'Mark as unread' : 'Mark as read'} title={n.read ? 'Mark as unread' : 'Mark as read'}
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full cursor-pointer">
                        <span className={`h-2.5 w-2.5 rounded-full ${n.read ? 'border border-line' : 'bg-accent'}`} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border cursor-pointer ${checked ? 'border-accent bg-accent' : 'border-line bg-paper'}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${checked ? 'translate-x-4 bg-[#07111f]' : 'translate-x-0.5 bg-ink-soft'}`} />
    </button>
  )
}

function Preferences() {
  const [prefs, setPrefs] = useState(null)
  const [initial, setInitial] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getPreferences().then((p) => {
      if (!active) return
      setPrefs(p)
      setInitial(JSON.stringify(p))
    })
    return () => {
      active = false
    }
  }, [])

  if (!prefs) return <DashboardSkeleton />
  const dirty = JSON.stringify(prefs) !== initial
  const setChannel = (cat, ch) => (v) => setPrefs((p) => ({ ...p, channels: { ...p.channels, [cat]: { ...p.channels[cat], [ch]: v } } }))

  const save = async () => {
    setSaving(true)
    const saved = await savePreferences(prefs)
    setInitial(JSON.stringify(saved))
    setSaving(false)
    toast('Notification preferences saved.')
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SectionCard title="Channels" subtitle="Choose where each kind of notification reaches you" className="lg:col-span-2" bodyClassName="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="w-24 px-3 py-3 text-center font-semibold">In-app</th>
              <th className="w-24 px-5 py-3 text-center font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <p className="text-ink">{c.label}</p>
                  <p className="text-xs text-ink-soft">{c.description}</p>
                </td>
                <td className="px-3 py-3 text-center"><Toggle checked={prefs.channels[c.id].inApp} onChange={setChannel(c.id, 'inApp')} label={`${c.label} in-app`} /></td>
                <td className="px-5 py-3 text-center"><Toggle checked={prefs.channels[c.id].email} onChange={setChannel(c.id, 'email')} label={`${c.label} email`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Reminders">
          <label htmlFor="reminder-days" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Start reminding me</label>
          <select id="reminder-days" value={prefs.reminderDays} onChange={(e) => setPrefs((p) => ({ ...p, reminderDays: Number(e.target.value) }))}
            className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer">
            {[3, 5, 7, 10, 14].map((d) => <option key={d} value={d}>{d} days before the due date{d === 10 ? ' (policy default)' : ''}</option>)}
          </select>
          <p className="mt-2 text-xs text-ink-soft">Reminders repeat daily until the item is done, and continue while it is overdue.</p>
        </SectionCard>
        <SectionCard title="Email digest">
          <div className="space-y-3">
            <select value={prefs.digest} onChange={(e) => setPrefs((p) => ({ ...p, digest: e.target.value }))} aria-label="Digest frequency"
              className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer">
              <option value="off">Off: send each email right away</option>
              <option value="daily">Daily summary</option>
              <option value="weekly">Weekly summary (Monday)</option>
            </select>
            {prefs.digest !== 'off' && (
              <input type="time" value={prefs.digestTime} onChange={(e) => setPrefs((p) => ({ ...p, digestTime: e.target.value }))} aria-label="Digest time"
                className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
            )}
          </div>
        </SectionCard>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPrefs(JSON.parse(initial))} disabled={!dirty}>Discard</Button>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save preferences</Button>
        </div>
      </div>
    </div>
  )
}

function NotificationsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'preferences' ? 'preferences' : 'inbox'
  return (
    <DashboardShell>
      <PageHeader eyebrow="Approvals & notifications" title="Notification centre" subtitle="Everything that needs your attention, and how you want to hear about it." />
      <Tabs active={tab} onChange={(id) => setParams(id === 'inbox' ? {} : { tab: id })} tabs={[
        { id: 'inbox', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Settings2 },
      ]} />
      {tab === 'inbox' ? <Inbox /> : <Preferences />}
    </DashboardShell>
  )
}

export default NotificationsPage
