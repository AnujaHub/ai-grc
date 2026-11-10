import { useState } from 'react'
import { Sparkles, BadgeCheck, XCircle, Check, X } from 'lucide-react'
import { Button, Modal } from '../../components/ui'
import { timeAgo } from '../dashboard/utils/format'

export function AiLabel({ item }) {
  if (item.status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
        <BadgeCheck className="h-3 w-3" /> Confirmed by {item.reviewedBy}
      </span>
    )
  }
  if (item.status === 'dismissed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft">
        <XCircle className="h-3 w-3" /> Dismissed by {item.reviewedBy}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[11px] font-medium text-violet-300">
      <Sparkles className="h-3 w-3" /> AI suggestion · not reviewed
    </span>
  )
}

export function Confidence({ value }) {
  const pct = Math.round(value * 100)
  const tone = pct >= 85 ? 'bg-accent' : pct >= 70 ? 'bg-warning' : 'bg-danger'
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-soft" title="How confident the model is. Always verify before accepting.">
      Confidence
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line"><span className={`block h-full ${tone}`} style={{ width: `${pct}%` }} /></span>
      <span className="font-mono text-ink">{pct}%</span>
    </span>
  )
}

export function AiCard({ item, children, onReview, canReview, acceptLabel = 'Accept' }) {
  return (
    <article className={`rounded-xl border bg-paper-dark ${item.status === 'suggested' ? 'border-violet-400/30' : 'border-line'}`}>
      {children}
      <footer className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <AiLabel item={item} />
          <Confidence value={item.confidence} />
          <span className="text-xs text-ink-soft">{item.status === 'suggested' ? `Generated ${timeAgo(item.generatedAt)}` : `Reviewed ${timeAgo(item.reviewedAt)}`}</span>
        </div>
        {item.status === 'suggested' && canReview && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onReview(item, 'dismissed')}><X className="h-4 w-4" /> Dismiss</Button>
            <Button onClick={() => onReview(item, 'accepted')}><Check className="h-4 w-4" /> {acceptLabel}</Button>
          </div>
        )}
      </footer>
      {item.reviewNote && <p className="border-t border-line px-5 py-2 text-xs text-ink-soft">Review note: {item.reviewNote}</p>}
    </article>
  )
}

export function ReviewModal({ review, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  if (!review) return null
  const accepting = review.decision === 'accepted'

  const confirm = async () => {
    setBusy(true)
    await onConfirm(note.trim())
    setBusy(false)
    setNote('')
  }

  return (
    <Modal open onClose={onClose} size="sm" title={accepting ? 'Accept AI suggestion?' : 'Dismiss AI suggestion?'} subtitle={review.title}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={confirm} loading={busy} disabled={!accepting && !note.trim()}>{accepting ? 'Accept' : 'Dismiss'}</Button></>}>
      <p className="mb-3 text-sm text-ink-soft">
        {accepting ? review.acceptText : 'The suggestion will be kept in the history as dismissed.'} Your name is recorded as the reviewer.
      </p>
      <label htmlFor="ai-note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Note {accepting ? '(optional)' : '(required)'}</label>
      <textarea id="ai-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={accepting ? 'Anything you changed or checked' : 'Why is this not valid?'}
        className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
    </Modal>
  )
}
