import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, X, Lock, ExternalLink, Send, Circle } from 'lucide-react'
import { Alert, Button, Modal, PageHeader, StatusBadge } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import SectionCard from '../dashboard/components/SectionCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { initials, timeAgo } from '../dashboard/utils/format'
import { canReview, getCurrentUser, getFullName } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { addApprovalComment, decideApproval, getApproval } from './approvalsData'

const longDate = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function ApprovalDetailPage() {
  const { id } = useParams()
  const user = getCurrentUser()
  const me = getFullName(user) || 'You'
  const loader = useCallback(() => getApproval(id), [id])
  const { data: item, loading, error, reload, setData } = useDashboardData(loader)
  const [decision, setDecision] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [comment, setComment] = useState('')

  const own = item?.requestedBy === me
  const canDecide = item && item.status === 'pending' && canReview(user) && !own

  const decide = async () => {
    setBusy(true)
    const updated = await decideApproval(item, decision, reason.trim(), me)
    setData(updated)
    toast(decision === 'approved' ? `${item.id} approved.` : `${item.id} rejected. ${item.requestedBy} has been notified.`, decision === 'approved' ? 'success' : 'warning')
    setBusy(false)
    setDecision(null)
    setReason('')
  }

  const post = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setData(await addApprovalComment(id, comment.trim(), me))
    setComment('')
    toast('Comment added.')
  }

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {item && (
        <>
          <PageHeader
            back={{ to: '/approvals', label: 'Approvals' }}
            crumb={item.id}
            eyebrow={`${item.id} · ${item.type}`}
            title={item.title}
            badge={<StatusBadge status={item.status} />}
            actions={canDecide && (
              <>
                <Button variant="secondary" onClick={() => setDecision('rejected')}><X className="h-4 w-4" /> Reject</Button>
                <Button onClick={() => setDecision('approved')}><Check className="h-4 w-4" /> Approve</Button>
              </>
            )}
          />

          {item.status === 'pending' && own && <Alert variant="info"><span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> You submitted this request, so another approver must decide it (segregation of duties).</span></Alert>}
          {item.status === 'pending' && !canReview(user) && !own && <Alert variant="info">Only administrators can decide approval requests.</Alert>}
          {item.status !== 'pending' && (
            <Alert variant={item.status === 'approved' ? 'success' : 'error'}>
              {item.status === 'approved' ? 'Approved' : 'Rejected'}{item.decidedBy ? ` by ${item.decidedBy}` : ''}{item.decidedAt ? ` on ${longDate(item.decidedAt)}` : ''}.{item.comment ? ` "${item.comment}"` : ''}
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <SectionCard title="Request" action={item.link && { label: 'Open item', to: item.link }}>
                <p className="text-sm text-ink">{item.description}</p>
                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                  {item.details.map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-ink-soft">{label}</dt><dd className="text-right text-ink">{val}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>

              <SectionCard title="Discussion" subtitle={`${item.comments.length} comment${item.comments.length === 1 ? '' : 's'}`}>
                <ul className="space-y-3">
                  {item.comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[11px] text-accent">{initials(c.author)}</span>
                      <div className="flex-1 rounded-lg border border-line bg-paper px-3 py-2">
                        <p className="text-xs text-ink-soft"><span className="font-medium text-ink">{c.author}</span> · {timeAgo(c.at)}</p>
                        <p className="mt-1 text-sm text-ink">{c.text}</p>
                      </div>
                    </li>
                  ))}
                  {!item.comments.length && <li className="text-sm text-ink-soft">No comments yet. Ask a question before deciding.</li>}
                </ul>
                <form onSubmit={post} className="mt-4 flex gap-2">
                  <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" aria-label="Add a comment"
                    className="flex-1 border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
                  <Button type="submit" disabled={!comment.trim()} aria-label="Post comment"><Send className="h-4 w-4" /></Button>
                </form>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="Details">
                <dl className="divide-y divide-line text-sm">
                  <div className="flex justify-between py-2.5"><dt className="text-ink-soft">Requested by</dt><dd className="text-ink">{item.requestedBy}</dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-ink-soft">Submitted</dt><dd className="text-ink">{longDate(item.submittedAt)}</dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-ink-soft">Priority</dt><dd><StatusBadge status={item.priority} /></dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-ink-soft">Type</dt><dd className="text-ink">{item.type}</dd></div>
                </dl>
                {item.link && (
                  <Link to={item.link} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> View the {item.type.toLowerCase()}
                  </Link>
                )}
              </SectionCard>

              <SectionCard title="History">
                <ol className="space-y-3">
                  {item.history.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <Circle className={`mt-1 h-2.5 w-2.5 shrink-0 ${i === item.history.length - 1 ? 'fill-accent text-accent' : 'text-ink-soft'}`} />
                      <div>
                        <p className="text-ink">{h.action}</p>
                        <p className="text-xs text-ink-soft">{h.actor} · {timeAgo(h.at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            </div>
          </div>

          <Modal
            open={Boolean(decision)}
            onClose={() => setDecision(null)}
            size="sm"
            title={decision === 'approved' ? 'Approve request' : 'Reject request'}
            subtitle={item.title}
            footer={<><Button variant="secondary" onClick={() => setDecision(null)}>Cancel</Button>
              <Button onClick={decide} loading={busy} disabled={decision === 'rejected' && !reason.trim()}>{decision === 'approved' ? 'Approve' : 'Reject'}</Button></>}
          >
            <label htmlFor="decision-comment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Comment {decision === 'rejected' ? '(required)' : '(optional)'}
            </label>
            <textarea id="decision-comment" rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder={decision === 'rejected' ? 'Explain why, so the requester can fix it' : 'Optional note for the audit trail'}
              className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
          </Modal>
        </>
      )}
    </DashboardState>
  )
}

export default ApprovalDetailPage
