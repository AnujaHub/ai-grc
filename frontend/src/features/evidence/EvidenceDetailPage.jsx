import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Download, Upload, Check, X, Link2, History, Pencil, Lock, GitCompare, ArrowRight, Trash2 } from 'lucide-react'
import { Alert, Button, Modal, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import SectionCard from '../dashboard/components/SectionCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { daysUntil, timeAgo } from '../dashboard/utils/format'
import { canEdit, canReview, getCurrentUser, getFullName } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { findControl } from '../controls/controlsData'
import { deleteEvidence, getEvidence, reviewEvidence, setEvidenceControls, formatBytes } from './evidenceData'
import { ControlPicker, FilePreview, FileTypeIcon } from './components'

const longDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

function Info({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  )
}

function VersionHistory({ versions }) {
  const [compare, setCompare] = useState([])
  const toggle = (v) => setCompare((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v].slice(-2)))
  const [newer, older] = [...compare].sort((a, b) => b - a).map((v) => versions.find((x) => x.version === v))

  return (
    <div className="space-y-4">
      {versions.length > 1 && <p className="text-xs text-ink-soft">Select two versions to compare them.</p>}
      <ol className="relative space-y-3 border-l border-line pl-5">
        {versions.map((v, i) => (
          <li key={v.version} className="relative">
            <span className={`absolute -left-[26px] top-3 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-accent' : 'bg-line'}`} />
            <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${compare.includes(v.version) ? 'border-accent bg-accent-soft' : 'border-line bg-paper'}`}>
              {versions.length > 1 && (
                <input type="checkbox" checked={compare.includes(v.version)} onChange={() => toggle(v.version)} className="mt-1 h-4 w-4 accent-[#38d9c2]" aria-label={`Compare version ${v.version}`} />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-ink">v{v.version}</span>
                  {i === 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">Current</span>}
                  <span className="text-xs text-ink-soft">{longDate(v.uploadedAt)} · {v.uploadedBy} · {formatBytes(v.sizeBytes)}</span>
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{v.note}</span>
              </span>
            </label>
          </li>
        ))}
      </ol>

      {newer && older && (
        <div className="rounded-xl border border-accent/30 bg-paper p-4">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink"><GitCompare className="h-4 w-4 text-accent" /> v{older.version} <ArrowRight className="h-3.5 w-3.5" /> v{newer.version}</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-ink-soft"><th className="pb-2 font-normal" /><th className="pb-2 font-mono font-normal">v{older.version}</th><th className="pb-2 font-mono font-normal">v{newer.version}</th></tr></thead>
            <tbody className="divide-y divide-line">
              {[
                ['Uploaded', longDate(older.uploadedAt), longDate(newer.uploadedAt)],
                ['By', older.uploadedBy, newer.uploadedBy],
                ['Size', formatBytes(older.sizeBytes), formatBytes(newer.sizeBytes)],
                ['Note', older.note, newer.note],
              ].map(([label, a, b]) => (
                <tr key={label}>
                  <td className="py-2 pr-3 text-xs text-ink-soft">{label}</td>
                  <td className="py-2 pr-3 text-ink-soft">{a}</td>
                  <td className={`py-2 ${a !== b ? 'text-accent' : 'text-ink-soft'}`}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-soft">Size change: {newer.sizeBytes >= older.sizeBytes ? '+' : '−'}{formatBytes(Math.abs(newer.sizeBytes - older.sizeBytes))}</p>
        </div>
      )}
    </div>
  )
}

function EvidenceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const me = getFullName(user)
  const editable = canEdit(user)
  const loader = useCallback(() => getEvidence(id), [id])
  const { data: item, loading, error, reload, setData } = useDashboardData(loader)
  const [tab, setTab] = useState('controls')
  const [editingControls, setEditingControls] = useState(null)
  const [review, setReview] = useState(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const ownUpload = item && item.versions[0].uploadedBy === me
  const showReview = item && canReview(user) && item.status === 'in_review'

  const saveControls = async () => {
    setBusy(true)
    const updated = await setEvidenceControls(id, editingControls)
    setData((d) => ({ ...d, controls: updated.controls }))
    setEditingControls(null)
    setBusy(false)
    toast(`Linked controls updated for ${id}.`)
  }

  const submitReview = async () => {
    setBusy(true)
    const updated = await reviewEvidence(id, review, comment, me)
    setData((d) => ({ ...d, status: updated.status, reviewer: updated.reviewer, reviewComment: updated.reviewComment }))
    toast(review === 'approved' ? `${id} approved.` : `${id} rejected. The uploader has been notified.`, review === 'approved' ? 'success' : 'warning')
    setReview(null)
    setComment('')
    setBusy(false)
  }

  const remove = async () => {
    if (!window.confirm(`Delete "${item.title}" from this browser prototype?`)) return
    setBusy(true)
    await deleteEvidence(id)
    navigate('/evidence')
  }

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {item && (
        <>
          <PageHeader
            back={{ to: '/evidence', label: 'Evidence library' }}
            eyebrow={`${item.id} · ${item.category}`}
            title={item.title}
            badge={<StatusBadge status={item.status} />}
            actions={
              <>
                <Button variant="secondary" onClick={() => toast(`Downloading ${item.fileName}…`, 'info')}><Download className="h-4 w-4" /> Download</Button>
                {editable && ['png', 'jpg', 'jpeg', 'webp'].includes(item.fileType) && <Link to={`/evidence/${item.id}/edit`}><Button variant="secondary"><Pencil className="h-4 w-4" /> Edit image</Button></Link>}
                {editable && <Link to={`/evidence/upload?version=${item.id}`}><Button variant="secondary"><Upload className="h-4 w-4" /> New version</Button></Link>}
                {editable && <Button variant="secondary" onClick={remove} disabled={busy}><Trash2 className="h-4 w-4 text-danger" /> Delete</Button>}
                {showReview && !ownUpload && (
                  <>
                    <Button variant="secondary" onClick={() => setReview('rejected')}><X className="h-4 w-4" /> Reject</Button>
                    <Button onClick={() => setReview('approved')}><Check className="h-4 w-4" /> Approve</Button>
                  </>
                )}
              </>
            }
          />

          {showReview && ownUpload && (
            <Alert variant="info"><span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> You uploaded this version, so another reviewer must approve it (segregation of duties).</span></Alert>
          )}
          {item.status === 'rejected' && item.reviewComment && (
            <Alert variant="error"><span className="font-semibold">Rejected by {item.reviewer}:</span> {item.reviewComment}</Alert>
          )}
          {item.status === 'expired' && <Alert variant="warning">This evidence expired on {longDate(item.validUntil)}. Upload a new version to keep the linked controls covered.</Alert>}
          {['png', 'jpg', 'jpeg', 'webp'].includes(item.fileType) && (
            <Alert variant="info">Image editing is not enabled for this uploaded evidence yet. The original file remains available in this in-platform preview.</Alert>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <SectionCard title="Preview" subtitle={`${item.fileName} · v${item.versions[0].version}`}>
                <FilePreview item={item} />
              </SectionCard>

              <div className="rounded-xl border border-line bg-paper-dark">
                <div className="px-5 pt-2">
                  <Tabs active={tab} onChange={setTab} tabs={[
                    { id: 'controls', label: 'Linked controls', icon: Link2, count: item.controls.length },
                    { id: 'versions', label: 'Version history', icon: History, count: item.versions.length },
                  ]} />
                </div>
                <div className="p-5">
                  {tab === 'controls' ? (
                    editingControls ? (
                      <div className="space-y-4">
                        <ControlPicker value={editingControls} onChange={setEditingControls} />
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setEditingControls(null)}>Cancel</Button>
                          <Button onClick={saveControls} loading={busy} disabled={!editingControls.length}>Save links</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {editable && (
                          <div className="mb-3 flex justify-end">
                            <Button variant="secondary" onClick={() => setEditingControls(item.controls)}><Pencil className="h-4 w-4" /> Edit links</Button>
                          </div>
                        )}
                        <ul className="divide-y divide-line">
                          {item.controls.map((code) => {
                            const control = findControl(code)
                            return (
                              <li key={code}>
                                <Link to={`/controls/${code}`} className="flex items-center gap-3 py-3 hover:text-accent">
                                  <span className="w-12 font-mono text-xs text-accent">{code}</span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-ink">{control?.title || 'Unknown control'}</span>
                                    <span className="block truncate text-xs text-ink-soft">{control?.domain}</span>
                                  </span>
                                  {control && <StatusBadge status={control.status} />}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </>
                    )
                  ) : (
                    <VersionHistory versions={item.versions} />
                  )}
                </div>
              </div>
            </div>

            <SectionCard title="Information" className="h-fit">
              <div className="mb-4 flex items-center gap-3">
                <FileTypeIcon type={item.fileType} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{item.fileName}</p>
                  <p className="font-mono text-xs uppercase text-ink-soft">{item.fileType} · {formatBytes(item.sizeBytes)}</p>
                </div>
              </div>
              <dl className="divide-y divide-line">
                <Info label="Category">{item.category}</Info>
                <Info label="Confidentiality">{item.confidentiality}</Info>
                <Info label="Uploaded by">{item.versions[0].uploadedBy}<span className="block text-xs text-ink-soft">{timeAgo(item.versions[0].uploadedAt)}</span></Info>
                <Info label="Valid until">
                  {longDate(item.validUntil)}
                  {item.validUntil && daysUntil(item.validUntil) >= 0 && daysUntil(item.validUntil) <= 30 && <span className="block text-xs text-warning">Expires in {daysUntil(item.validUntil)} days</span>}
                </Info>
                <Info label="Reviewer">{item.reviewer || 'Not reviewed yet'}</Info>
              </dl>
              {item.description && <p className="mt-4 border-t border-line pt-4 text-sm text-ink-soft">{item.description}</p>}
            </SectionCard>
          </div>

          <Modal
            open={Boolean(review)}
            onClose={() => setReview(null)}
            size="sm"
            title={review === 'approved' ? 'Approve evidence' : 'Reject evidence'}
            subtitle={`${item.id} · v${item.versions[0].version}`}
            footer={
              <>
                <Button variant="secondary" onClick={() => setReview(null)}>Cancel</Button>
                <Button onClick={submitReview} loading={busy} disabled={review === 'rejected' && !comment.trim()}>
                  {review === 'approved' ? 'Approve' : 'Reject'}
                </Button>
              </>
            }
          >
            <label htmlFor="review-comment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Comment {review === 'rejected' ? '(required)' : '(optional)'}
            </label>
            <textarea id="review-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={review === 'rejected' ? 'Explain what is missing so the uploader can fix it' : 'Optional note for the audit trail'}
              className="w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
          </Modal>
        </>
      )}
    </DashboardState>
  )
}

export default EvidenceDetailPage
