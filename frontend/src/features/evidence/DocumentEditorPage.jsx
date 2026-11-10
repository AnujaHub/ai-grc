import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Undo2, Redo2, Save, Send, Check, X } from 'lucide-react'
import { Alert, Button, PageHeader, StatusBadge } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import SectionCard from '../dashboard/components/SectionCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { timeAgo } from '../dashboard/utils/format'
import { canEdit, canReview, getCurrentUser, getFullName } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { TEAM } from '../controls/controlsData'
import { getPolicy, savePolicy } from './evidenceData'
import { ControlPicker } from './components'

const TOOLS = [
  { cmd: 'bold', Icon: Bold, label: 'Bold' },
  { cmd: 'italic', Icon: Italic, label: 'Italic' },
  { cmd: 'underline', Icon: Underline, label: 'Underline' },
  { cmd: 'formatBlock', arg: 'h2', Icon: Heading2, label: 'Heading' },
  { cmd: 'formatBlock', arg: 'h3', Icon: Heading3, label: 'Subheading' },
  { cmd: 'insertUnorderedList', Icon: List, label: 'Bullet list' },
  { cmd: 'insertOrderedList', Icon: ListOrdered, label: 'Numbered list' },
  { cmd: 'undo', Icon: Undo2, label: 'Undo' },
  { cmd: 'redo', Icon: Redo2, label: 'Redo' },
]

const NEW_DOCUMENT = {
  title: 'Untitled document',
  category: 'Policy',
  status: 'draft',
  version: '0.1',
  controls: [],
  nextReview: null,
  content: '<h2>1. Purpose</h2><p></p><h2>2. Scope</h2><p></p><h2>3. Requirements</h2><p></p>',
}

const nextMinor = (version) => {
  const [major, minor = '0'] = version.split('.')
  return `${major}.${Number(minor) + 1}`
}

const inputClass = 'w-full border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'

function DocumentEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const user = getCurrentUser()
  const me = getFullName(user) || 'You'
  const loader = useCallback(
    () => (isNew ? Promise.resolve({ ...NEW_DOCUMENT, owner: getFullName(getCurrentUser()) || 'You' }) : getPolicy(id)),
    [isNew, id],
  )
  const { data, loading, error, reload } = useDashboardData(loader)
  const editorRef = useRef(null)
  const [doc, setDoc] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [words, setWords] = useState(0)

  if (data && doc === null) setDoc(data)

  const readOnly = !canEdit(user) || doc?.status === 'in_review'
  const approvedLocked = doc?.status === 'approved'
  const reviewer = canReview(user) && doc?.owner !== me

  useEffect(() => {
    if (editorRef.current && doc && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = doc.content
      setWords(editorRef.current.innerText.trim().split(/\s+/).filter(Boolean).length)
    }
  }, [doc])

  const update = (patch) => {
    setDoc((d) => ({ ...d, ...patch }))
    setDirty(true)
  }

  const run = (tool) => {
    editorRef.current?.focus()
    document.execCommand(tool.cmd, false, tool.arg)
    setDirty(true)
  }

  const persist = async (patch = {}) => {
    setSaving(true)
    const saved = await savePolicy(isNew ? null : id, { ...doc, content: editorRef.current?.innerHTML || doc.content, ...patch })
    setDoc(saved)
    setDirty(false)
    setSaving(false)
    setSavedAt(new Date().toISOString())
    toast({ in_review: 'Submitted for review.', approved: `Version ${saved.version} approved.`, draft: patch.status === 'draft' ? 'Changes requested. The document is back in draft.' : 'Draft saved.' }[saved.status] || 'Saved.')
    if (isNew) navigate(`/evidence/documents/${saved.id}`, { replace: true })
  }

  const startNewVersion = () => update({ status: 'draft', version: nextMinor(doc.version) })

  return (
    <DashboardState loading={loading || !doc} error={error} onRetry={reload}>
      {doc && (
        <>
          <PageHeader
            back={{ to: '/evidence?tab=documents', label: 'Policy documents' }}
            eyebrow={`${isNew ? 'New document' : doc.id} · v${doc.version}`}
            title={doc.title || 'Untitled document'}
            badge={<StatusBadge status={doc.status} />}
            actions={
              <>
                <span className="self-center text-xs text-ink-soft">
                  {saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? `Saved ${timeAgo(savedAt)}` : doc.updatedAt ? `Last saved ${timeAgo(doc.updatedAt)}` : ''}
                </span>
                {!readOnly && !approvedLocked && (
                  <>
                    <Button variant="secondary" onClick={() => persist()} loading={saving} disabled={!dirty && !isNew}><Save className="h-4 w-4" /> Save draft</Button>
                    <Button onClick={() => persist({ status: 'in_review' })} disabled={saving}><Send className="h-4 w-4" /> Submit for review</Button>
                  </>
                )}
                {doc.status === 'in_review' && reviewer && (
                  <>
                    <Button variant="secondary" onClick={() => persist({ status: 'draft' })}><X className="h-4 w-4" /> Request changes</Button>
                    <Button onClick={() => persist({ status: 'approved' })}><Check className="h-4 w-4" /> Approve</Button>
                  </>
                )}
                {approvedLocked && canEdit(user) && <Button variant="secondary" onClick={startNewVersion}>Start new version</Button>}
              </>
            }
          />

          {doc.status === 'in_review' && !reviewer && <Alert variant="info">This document is in review and cannot be edited. {doc.owner === me ? 'Another reviewer must approve it.' : ''}</Alert>}
          {approvedLocked && <Alert variant="success">Version {doc.version} is approved and locked. Start a new version to make changes; the approved version stays in the record.</Alert>}
          {!canEdit(user) && <Alert variant="info">Read-only access.</Alert>}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="overflow-hidden rounded-xl border border-line bg-paper-dark lg:col-span-3">
              <input
                value={doc.title}
                onChange={(e) => update({ title: e.target.value })}
                disabled={readOnly || approvedLocked}
                aria-label="Document title"
                className="w-full border-0 border-b border-line px-6 py-4 font-display text-xl font-semibold text-ink outline-none"
                style={{ background: 'transparent' }}
              />
              {!readOnly && !approvedLocked && (
                <div className="flex flex-wrap gap-0.5 border-b border-line bg-paper px-3 py-1.5" role="toolbar" aria-label="Formatting">
                  {TOOLS.map((tool) => (
                    <button key={tool.label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(tool)} title={tool.label} aria-label={tool.label}
                      className="rounded p-2 text-ink-soft hover:bg-paper-dark hover:text-accent cursor-pointer">
                      <tool.Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable={!readOnly && !approvedLocked}
                suppressContentEditableWarning
                onInput={() => {
                  setDirty(true)
                  setWords(editorRef.current.innerText.trim().split(/\s+/).filter(Boolean).length)
                }}
                className="doc-editor min-h-[460px] px-6 py-5 text-sm leading-relaxed text-ink outline-none [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_p]:min-h-[1.5em] [&_ul]:list-disc"
              />
              <div className="border-t border-line px-6 py-2 text-right text-xs text-ink-soft">{words} words</div>
            </div>

            <div className="space-y-4">
              <SectionCard title="Document details">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="doc-category" className={labelClass}>Category</label>
                    <select id="doc-category" value={doc.category} onChange={(e) => update({ category: e.target.value })} disabled={readOnly || approvedLocked} className={`${inputClass} cursor-pointer`}>
                      <option>Policy</option><option>Procedure</option><option>Standard</option><option>Guideline</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="doc-owner" className={labelClass}>Owner</label>
                    <select id="doc-owner" value={doc.owner} onChange={(e) => update({ owner: e.target.value })} disabled={readOnly || approvedLocked} className={`${inputClass} cursor-pointer`}>
                      {[...new Set([doc.owner, ...TEAM.map((m) => m.name)])].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="doc-review" className={labelClass}>Next review</label>
                    <input id="doc-review" type="date" value={doc.nextReview ? doc.nextReview.slice(0, 10) : ''} disabled={readOnly || approvedLocked}
                      onChange={(e) => update({ nextReview: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputClass} />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Linked controls">
                {readOnly || approvedLocked ? (
                  <p className="font-mono text-xs text-accent">{doc.controls.join(', ') || 'None'}</p>
                ) : (
                  <ControlPicker value={doc.controls} onChange={(controls) => update({ controls })} />
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </DashboardState>
  )
}

export default DocumentEditorPage
