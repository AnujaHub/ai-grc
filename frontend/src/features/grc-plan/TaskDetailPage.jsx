import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckSquare, Square, MessageSquare, Send, FileText, Upload, CheckCircle2 } from 'lucide-react'
import { Alert, Button, ConfirmDialog, PageHeader, StatusBadge } from '../../components/ui'
import { toast } from '../../utils/toast'
import DashboardState from '../dashboard/components/DashboardState'
import SectionCard from '../dashboard/components/SectionCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { dueLabel, dueTone, initials, timeAgo } from '../dashboard/utils/format'
import { canEdit, canReview, getCurrentUser, getFullName } from '../../utils/roles'
import { findControl } from '../controls/controlsData'
import { evidenceForControl } from '../evidence/evidenceData'
import { PRIORITIES, TASK_STATUSES, addTaskComment, displayStatus, getTask, toggleChecklistItem, updateTask } from './planData'

const longDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const selectClass = 'border border-line py-1 pl-2 pr-7 text-sm text-ink outline-none focus:border-accent cursor-pointer'

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  )
}

function TaskDetailPage() {
  const { id } = useParams()
  const user = getCurrentUser()
  const me = getFullName(user) || 'You'
  const loader = useCallback(() => getTask(id), [id])
  const { data, loading, error, reload, setData } = useDashboardData(loader)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  const task = data?.task
  const editable = canEdit(user) && (task?.owner === me || canReview(user))
  const control = task?.control ? findControl(task.control) : null
  const evidence = task?.control ? evidenceForControl(task.control) : []
  const checklistDone = task ? task.checklist.every((c) => c.done) : false

  const apply = (updated) => setData((d) => ({ ...d, task: updated }))
  const change = async (patch) => {
    apply(await updateTask(id, patch))
    if (patch.status) toast(patch.status === 'completed' ? `${id} marked complete.` : `${id} status updated.`)
    else if (patch.priority) toast(`${id} priority updated.`)
  }
  const toggle = async (itemId) => apply(await toggleChecklistItem(id, itemId))

  const post = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setPosting(true)
    apply(await addTaskComment(id, comment.trim(), me))
    toast('Update posted.')
    setComment('')
    setPosting(false)
  }

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {task && (
        <>
          <PageHeader
            back={{ to: '/grc-plan?tab=tasks', label: 'All tasks' }}
            eyebrow={`${task.id} · ${data.milestone?.title || 'No milestone'}`}
            title={task.title}
            badge={<StatusBadge status={displayStatus(task)} />}
            actions={editable && task.status !== 'completed' && (
              <Button onClick={() => setConfirmComplete(true)} disabled={task.checklist.length > 0 && !checklistDone}
                title={!checklistDone ? 'Complete the checklist first' : undefined}>
                <CheckCircle2 className="h-4 w-4" /> Mark complete
              </Button>
            )}
          />

          {task.status === 'blocked' && task.blockedReason && <Alert variant="error"><span className="font-semibold">Blocked:</span> {task.blockedReason}</Alert>}
          {editable && task.status !== 'completed' && task.checklist.length > 0 && !checklistDone && (
            <Alert variant="info">Complete every checklist item before marking this task complete.</Alert>
          )}
          {!canEdit(user) && <Alert variant="info">Read-only access.</Alert>}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <SectionCard title="Description">
                <p className="text-sm text-ink">{task.description || 'No description.'}</p>
              </SectionCard>

              <SectionCard title="Checklist" subtitle={`${task.checklist.filter((c) => c.done).length} of ${task.checklist.length} done`}>
                {task.checklist.length === 0 ? <p className="text-sm text-ink-soft">No checklist items.</p> : (
                  <ul className="space-y-1">
                    {task.checklist.map((item) => (
                      <li key={item.id}>
                        <button type="button" disabled={!editable} onClick={() => toggle(item.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-paper disabled:cursor-default disabled:hover:bg-transparent cursor-pointer">
                          {item.done ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 text-ink-soft" />}
                          <span className={item.done ? 'text-ink-soft line-through' : 'text-ink'}>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Updates" subtitle={`${task.comments.length} comment${task.comments.length === 1 ? '' : 's'}`}>
                <ul className="space-y-4">
                  {task.comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[11px] text-accent">{initials(c.author)}</span>
                      <div className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2">
                        <p className="text-xs text-ink-soft"><span className="font-medium text-ink">{c.author}</span> · {timeAgo(c.at)}</p>
                        <p className="mt-1 text-sm text-ink">{c.text}</p>
                      </div>
                    </li>
                  ))}
                  {task.comments.length === 0 && <li className="flex items-center gap-2 text-sm text-ink-soft"><MessageSquare className="h-4 w-4" /> No updates yet.</li>}
                </ul>
                {canEdit(user) && (
                  <form onSubmit={post} className="mt-4 flex gap-2">
                    <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add an update…" aria-label="Add an update"
                      className="flex-1 border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
                    <Button type="submit" loading={posting} disabled={!comment.trim()} aria-label="Post update"><Send className="h-4 w-4" /></Button>
                  </form>
                )}
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="Details">
                <dl className="divide-y divide-line">
                  <Row label="Status">
                    {editable ? (
                      <select value={task.status} onChange={(e) => (e.target.value === 'completed' ? setConfirmComplete(true) : change({ status: e.target.value }))} aria-label="Status" className={selectClass}>
                        {TASK_STATUSES.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.value === 'completed' && !checklistDone}>{s.label}</option>
                        ))}
                      </select>
                    ) : <StatusBadge status={displayStatus(task)} />}
                  </Row>
                  <Row label="Priority">
                    {editable ? (
                      <select value={task.priority} onChange={(e) => change({ priority: e.target.value })} aria-label="Priority" className={selectClass}>
                        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    ) : <StatusBadge status={task.priority} />}
                  </Row>
                  <Row label="Owner">{task.owner}</Row>
                  <Row label="Start">{longDate(task.startDate)}</Row>
                  <Row label="Due">
                    {longDate(task.dueDate)}
                    {task.status !== 'completed' && <span className={`block text-xs ${dueTone(task.dueDate)}`}>{dueLabel(task.dueDate)}</span>}
                  </Row>
                  <Row label="Progress">
                    {editable && task.status !== 'completed' ? (
                      <span className="flex items-center gap-2">
                        <input type="range" min="0" max="100" step="5" value={task.progress} onChange={(e) => change({ progress: Number(e.target.value) })}
                          aria-label="Progress" className="w-28 accent-[#38d9c2]" />
                        <span className="w-9 font-mono text-xs">{task.progress}%</span>
                      </span>
                    ) : <span className="font-mono">{task.progress}%</span>}
                  </Row>
                  <Row label="Milestone">{data.milestone ? <Link to="/grc-plan?tab=milestones" className="text-accent hover:underline">{data.milestone.id}</Link> : '—'}</Row>
                </dl>
              </SectionCard>

              {control && (
                <SectionCard title="Control" action={{ label: 'Open', to: `/controls/${control.code}` }}>
                  <p className="font-mono text-xs text-accent">{control.code}</p>
                  <p className="text-sm text-ink">{control.title}</p>
                  <div className="mt-2"><StatusBadge status={control.status} /></div>
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Evidence ({evidence.length})</p>
                    <ul className="space-y-2">
                      {evidence.map((e) => (
                        <li key={e.id}>
                          <Link to={`/evidence/${e.id}`} className="flex items-center gap-2 text-sm text-ink hover:text-accent">
                            <FileText className="h-4 w-4 shrink-0 text-ink-soft" /><span className="truncate">{e.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {canEdit(user) && (
                      <Link to={`/evidence/upload?control=${control.code}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                        <Upload className="h-3.5 w-3.5" /> Upload evidence
                      </Link>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
          <ConfirmDialog
            open={confirmComplete}
            tone="warning"
            title="Mark task as complete?"
            message="The task will be closed at 100% and the milestone progress will update. Make sure the evidence has been uploaded for review."
            confirmLabel="Mark complete"
            onConfirm={async () => {
              await change({ status: 'completed' })
              setConfirmComplete(false)
            }}
            onCancel={() => setConfirmComplete(false)}
          />
        </>
      )}
    </DashboardState>
  )
}

export default TaskDetailPage
