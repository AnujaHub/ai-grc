import { useEffect, useState } from 'react'
import { Check, X, MailCheck, MailWarning, Inbox } from 'lucide-react'
import { Button, EmptyState, Modal, StatusBadge } from '../../components/ui'
import { getCurrentUser, getFullName } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { timeAgo, initials } from '../dashboard/utils/format'
import { ROLE_OPTIONS, decideRegistration, listRegistrations, roleLabel } from './usersData'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'

function DecisionModal({ item, decision, onClose, onDone }) {
  const [role, setRole] = useState('responsable_conformite')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  if (!item) return null

  const submit = async () => {
    setBusy(true)
    const updated = await decideRegistration(item.id, decision, { role, reason, actor: getFullName(getCurrentUser()) || 'You' })
    setBusy(false)
    toast(decision === 'approved' ? `${item.name} approved as ${roleLabel(role)}. They can now sign in.` : `${item.name}'s registration rejected.`, decision === 'approved' ? 'success' : 'info')
    onDone(updated)
  }

  return (
    <Modal open onClose={onClose} size="sm" title={decision === 'approved' ? `Approve ${item.name}` : `Reject ${item.name}`} subtitle={`${item.email} · ${item.organisation}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} loading={busy} disabled={decision === 'rejected' && !reason.trim()}>{decision === 'approved' ? 'Approve' : 'Reject'}</Button></>}>
      {decision === 'approved' ? (
        <div>
          <label htmlFor="assign-role" className={labelClass}>Assign role</label>
          <select id="assign-role" value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer">
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="mt-2 text-xs text-ink-soft">Give the lowest role that lets them do their job. You can change it later.</p>
          {!item.emailVerified && <p className="mt-3 text-xs text-warning">This email address has not been verified yet.</p>}
        </div>
      ) : (
        <div>
          <label htmlFor="reject-reason" className={labelClass}>Reason (required)</label>
          <textarea id="reject-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Not an employee of this organization"
            className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
        </div>
      )}
    </Modal>
  )
}

function RegistrationsPanel() {
  const [items, setItems] = useState(null)
  const [deciding, setDeciding] = useState(null)

  useEffect(() => {
    let active = true
    listRegistrations().then((list) => active && setItems(list))
    return () => {
      active = false
    }
  }, [])

  if (!items) return <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>

  const pending = items.filter((r) => r.status === 'pending')
  const decided = items.filter((r) => r.status !== 'pending').sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-paper-dark">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Waiting for approval ({pending.length})</h2>
          <p className="mt-0.5 text-xs text-ink-soft">New users can only sign in after an administrator approves them.</p>
        </div>
        {pending.length === 0 ? <EmptyState icon={Inbox} title="No pending registrations" /> : (
          <ul className="divide-y divide-line">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs text-accent">{initials(r.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.name} <span className="font-normal text-ink-soft">· {r.jobTitle || 'No job title'}</span></p>
                    <p className="truncate text-xs text-ink-soft">{r.email} · {r.organisation} · {timeAgo(r.submittedAt)}</p>
                    <p className={`mt-1 inline-flex items-center gap-1 text-xs ${r.emailVerified ? 'text-accent' : 'text-warning'}`}>
                      {r.emailVerified ? <MailCheck className="h-3.5 w-3.5" /> : <MailWarning className="h-3.5 w-3.5" />}
                      {r.emailVerified ? 'Email verified' : 'Email not verified'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pl-13 sm:pl-0">
                  <Button variant="secondary" onClick={() => setDeciding({ item: r, decision: 'rejected' })}><X className="h-4 w-4" /> Reject</Button>
                  <Button onClick={() => setDeciding({ item: r, decision: 'approved' })}><Check className="h-4 w-4" /> Approve</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-line bg-paper-dark">
        <div className="border-b border-line px-5 py-4"><h2 className="text-sm font-semibold text-ink">Recent decisions</h2></div>
        <ul className="divide-y divide-line">
          {decided.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{r.name} <span className="text-ink-soft">· {r.email}</span></span>
              <span className="text-xs text-ink-soft">{r.status === 'approved' ? `as ${roleLabel(r.assignedRole)}` : r.reason} · by {r.decidedBy} · {timeAgo(r.decidedAt)}</span>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </section>

      {deciding && (
        <DecisionModal item={deciding.item} decision={deciding.decision} onClose={() => setDeciding(null)}
          onDone={(updated) => { setItems((list) => list.map((x) => (x.id === updated.id ? updated : x))); setDeciding(null) }} />
      )}
    </div>
  )
}

export default RegistrationsPanel
