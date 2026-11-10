import { useCallback, useEffect, useReducer, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Upload, Link2, Unlink, FileText, ShieldAlert, ListTodo, Search } from 'lucide-react'
import { Alert, Button, ConfirmDialog, EmptyState, Modal, PageHeader, StatusBadge } from '../../components/ui'
import { toast } from '../../utils/toast'
import DashboardState from '../dashboard/components/DashboardState'
import SectionCard from '../dashboard/components/SectionCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { dueLabel, dueTone, formatDate, timeAgo } from '../dashboard/utils/format'
import { canEdit, getCurrentUser } from '../../utils/roles'
import { evidenceForControl, linkEvidenceToControl, listEvidence, unlinkEvidenceFromControl } from '../evidence/evidenceData'
import { displayStatus, tasksForControl } from '../grc-plan/planData'
import { CONTROL_STATUSES, TEAM, getControl, updateControl } from './controlsData'

const longDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

function Detail({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  )
}

function LinkEvidenceModal({ open, onClose, code, linkedIds, onLinked }) {
  const [items, setItems] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    let active = true
    listEvidence().then((list) => active && setItems(list))
    return () => {
      active = false
    }
  }, [open])

  const available = (items || []).filter(
    (e) => !linkedIds.includes(e.id) && (!query || `${e.id} ${e.title} ${e.category}`.toLowerCase().includes(query.toLowerCase())),
  )

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const close = () => {
    setSelected([])
    setQuery('')
    setItems(null)
    onClose()
  }

  const save = async () => {
    setSaving(true)
    await linkEvidenceToControl(selected, code)
    setSaving(false)
    onLinked()
    toast(`${selected.length} evidence file${selected.length === 1 ? '' : 's'} linked to control ${code}.`)
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Link evidence to control ${code}`}
      subtitle="Select one or more files from the evidence library."
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={!selected.length} loading={saving}>Link {selected.length || ''} file{selected.length === 1 ? '' : 's'}</Button>
        </>
      }
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search evidence…" aria-label="Search evidence"
          className="w-full border border-line py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent" />
      </div>
      {items === null ? (
        <p className="py-6 text-center text-sm text-ink-soft">Loading library…</p>
      ) : available.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">No other evidence matches.</p>
      ) : (
        <ul className="space-y-2">
          {available.map((e) => (
            <li key={e.id}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${selected.includes(e.id) ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent/40'}`}>
                <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} className="h-4 w-4 accent-[#38d9c2]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{e.title}</span>
                  <span className="text-xs text-ink-soft">{e.id} · {e.category} · v{e.versions[0].version}</span>
                </span>
                <StatusBadge status={e.status} />
              </label>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

function ControlDetailPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const editable = canEdit(user)
  const loader = useCallback(() => getControl(code), [code])
  const { data, loading, error, reload, setData } = useDashboardData(loader)
  const [linkOpen, setLinkOpen] = useState(false)
  const [, refresh] = useReducer((n) => n + 1, 0)
  const [unlinking, setUnlinking] = useState(null)

  const evidence = data ? evidenceForControl(code) : []
  const tasks = data ? tasksForControl(code) : []
  const approvedEvidence = evidence.filter((e) => e.status === 'approved').length

  const change = async (patch) => {
    const control = await updateControl(code, patch)
    setData((d) => ({ ...d, control }))
    toast(patch.status ? `Control ${code} status updated.` : `Control ${code} is now owned by ${patch.owner}.`)
  }

  const unlink = async () => {
    await unlinkEvidenceFromControl(unlinking.id, code)
    toast(`${unlinking.title} unlinked from control ${code}.`, 'info')
    setUnlinking(null)
    refresh()
  }

  const control = data?.control

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {control && (
        <>
          <PageHeader
            back={{ to: '/controls', label: 'Controls catalogue' }}
            eyebrow={`Control ${control.code} · ${control.domain}`}
            title={control.title}
            badge={<StatusBadge status={control.status} />}
            actions={
              <>
                <Button variant="secondary" disabled={!data.previous} onClick={() => navigate(`/controls/${data.previous}`)} aria-label="Previous control"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="secondary" disabled={!data.next} onClick={() => navigate(`/controls/${data.next}`)} aria-label="Next control"><ChevronRight className="h-4 w-4" /></Button>
                {editable && <Link to={`/evidence/upload?control=${control.code}`}><Button><Upload className="h-4 w-4" /> Upload evidence</Button></Link>}
              </>
            }
          />

          {!editable && <Alert variant="info">Read-only access. Auditors can review this control and its evidence but cannot change them.</Alert>}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <SectionCard title="Control objective" subtitle="Summary. Refer to the licensed ISO/IEC 27001 and 27002 texts for the official wording.">
                <p className="text-sm leading-relaxed text-ink">{control.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-ink-soft">ISO/IEC 27001:2022 {control.domainCode}</span>
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-ink-soft">{control.department}</span>
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-ink-soft">{control.frequency} review</span>
                </div>
              </SectionCard>

              <SectionCard
                title="Evidence"
                subtitle={`${evidence.length} linked · ${approvedEvidence} approved`}
                bodyClassName="p-0"
              >
                {editable && (
                  <div className="flex justify-end border-b border-line px-5 py-3">
                    <Button variant="secondary" onClick={() => setLinkOpen(true)}><Link2 className="h-4 w-4" /> Link existing evidence</Button>
                  </div>
                )}
                {evidence.length === 0 ? (
                  <EmptyState icon={FileText} title="No evidence linked yet" message="Upload a new file or link one from the evidence library." />
                ) : (
                  <ul className="divide-y divide-line">
                    {evidence.map((e) => (
                      <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                        <FileText className="h-4 w-4 shrink-0 text-ink-soft" />
                        <Link to={`/evidence/${e.id}`} className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ink hover:text-accent">{e.title}</span>
                          <span className="text-xs text-ink-soft">{e.id} · v{e.versions[0].version} · {e.uploadedBy} · {timeAgo(e.uploadedAt)}</span>
                        </Link>
                        <StatusBadge status={e.status} />
                        {editable && (
                          <button type="button" onClick={() => setUnlinking(e)} className="rounded p-1.5 text-ink-soft hover:text-danger cursor-pointer" aria-label={`Unlink ${e.title}`} title="Unlink from this control">
                            <Unlink className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Related tasks" subtitle="From the GRC plan" action={{ label: 'GRC plan', to: '/grc-plan?tab=tasks' }}>
                {tasks.length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink-soft">No tasks are linked to this control.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <ListTodo className="h-4 w-4 shrink-0 text-ink-soft" />
                        <Link to={`/grc-plan/tasks/${t.id}`} className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ink hover:text-accent">{t.title}</span>
                          <span className="text-xs text-ink-soft">{t.id} · {t.owner} · <span className={dueTone(t.dueDate)}>{dueLabel(t.dueDate)}</span></span>
                        </Link>
                        <StatusBadge status={displayStatus(t)} />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="Details">
                <dl className="divide-y divide-line">
                  <Detail label="Status">
                    {editable ? (
                      <select value={control.status} onChange={(e) => change({ status: e.target.value })} aria-label="Status"
                        className="max-w-[10rem] border border-line py-1 pl-2 pr-7 text-sm text-ink outline-none focus:border-accent cursor-pointer">
                        {CONTROL_STATUSES.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.value === 'implemented' && approvedEvidence === 0 && control.status !== 'implemented'}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    ) : <StatusBadge status={control.status} />}
                  </Detail>
                  <Detail label="Owner">
                    {editable ? (
                      <select value={control.owner} onChange={(e) => change({ owner: e.target.value })} aria-label="Owner"
                        className="max-w-[10rem] border border-line py-1 pl-2 pr-7 text-sm text-ink outline-none focus:border-accent cursor-pointer">
                        {TEAM.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                    ) : control.owner}
                  </Detail>
                  <Detail label="Due date">
                    <span>{longDate(control.dueDate)}</span>
                    {control.status !== 'implemented' && <span className={`block text-xs ${dueTone(control.dueDate)}`}>{dueLabel(control.dueDate)}</span>}
                  </Detail>
                  <Detail label="Last reviewed">{control.lastReviewed ? formatDate(control.lastReviewed) : 'Never'}</Detail>
                  <Detail label="Risk level"><StatusBadge status={control.riskLevel} /></Detail>
                  <Detail label="Review frequency">{control.frequency}</Detail>
                </dl>
              </SectionCard>

              {approvedEvidence === 0 && control.status !== 'not_applicable' && (
                <Alert variant="warning">
                  <span className="inline-flex items-center gap-1.5 font-semibold"><ShieldAlert className="h-4 w-4" /> No approved evidence</span>
                  <span className="mt-1 block text-ink-soft">
                    {control.status === 'implemented'
                      ? 'This control is marked implemented, but the implementation cannot be verified until a reviewer approves at least one evidence file.'
                      : 'This control cannot be marked as implemented until at least one evidence file is approved by a reviewer.'}
                  </span>
                </Alert>
              )}
            </div>
          </div>

          <ConfirmDialog
            open={Boolean(unlinking)}
            title="Unlink evidence?"
            message={unlinking ? `${unlinking.title} will no longer support control ${control.code}. The file stays in the evidence library.` : ''}
            confirmLabel="Unlink"
            onConfirm={unlink}
            onCancel={() => setUnlinking(null)}
          />

          <LinkEvidenceModal open={linkOpen} onClose={() => setLinkOpen(false)} code={control.code} linkedIds={evidence.map((e) => e.id)} onLinked={refresh} />
        </>
      )}
    </DashboardState>
  )
}

export default ControlDetailPage
