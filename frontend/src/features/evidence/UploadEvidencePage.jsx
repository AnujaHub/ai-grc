import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UploadCloud, X, CheckCircle2, AlertCircle, FileUp } from 'lucide-react'
import { Alert, Button, PageHeader, TextField } from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import SectionCard from '../dashboard/components/SectionCard'
import AccessDenied from '../../components/AccessDenied'
import { canEdit, getCurrentUser, getFullName } from '../../utils/roles'
import { ACCEPTED_EXTENSIONS, CATEGORIES, CONFIDENTIALITY, MAX_FILES_PER_UPLOAD, MAX_FILE_MB, getEvidence, getStorage, uploadEvidence, uploadNewVersion, formatBytes } from './evidenceData'
import { AcceptedFormats, ControlPicker, FileTypeIcon } from './components'

const extensionOf = (name) => name.split('.').pop().toLowerCase()
const titleFromName = (name) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

const validateFile = (file, existing) => {
  if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name))) return `File type .${extensionOf(file.name)} is not allowed.`
  if (existing.filter((e) => !e.error).length >= MAX_FILES_PER_UPLOAD) return `Maximum ${MAX_FILES_PER_UPLOAD} files per upload.`
  if (file.size === 0) return 'File is empty.'
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB} MB.`
  if (existing.some((e) => e.file.name === file.name)) return 'This file is already in the list.'
  return null
}

const inputClass = 'w-full border border-line py-2.5 px-3 text-sm text-ink outline-none focus:border-accent'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'

function UploadEvidencePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const versionOf = params.get('version')
  const user = getCurrentUser()
  const inputRef = useRef(null)

  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [meta, setMeta] = useState({ category: '', confidentiality: 'Internal', validUntil: '', description: '', controls: params.get('control') ? [params.get('control')] : [] })
  const [note, setNote] = useState('')
  const [target, setTarget] = useState(null)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('select')
  const [created, setCreated] = useState([])
  const [storage, setStorage] = useState(null)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (versionOf) getEvidence(versionOf).then(setTarget).catch(() => setTarget(false))
  }, [versionOf])

  useEffect(() => {
    let active = true
    getStorage().then((s) => active && setStorage(s))
    return () => {
      active = false
    }
  }, [])

  const addFiles = (list) => {
    const picked = Array.from(list)
    setFiles((current) => {
      const next = [...current]
      picked.forEach((file) => {
        next.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, title: titleFromName(file.name), error: validateFile(file, next), progress: 0 })
      })
      return versionOf ? next.slice(-1) : next
    })
    setErrors((e) => ({ ...e, files: undefined }))
  }

  if (!canEdit(user)) return <AccessDenied />

  const valid = files.filter((f) => !f.error)
  const selectedBytes = valid.reduce((sum, f) => sum + f.file.size, 0)
  const overQuota = storage && selectedBytes > storage.freeBytes
  const setField = (key) => (e) => {
    setMeta((m) => ({ ...m, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const validate = () => {
    const found = {}
    if (!valid.length) found.files = 'Add at least one valid file.'
    if (overQuota) found.files = `Not enough storage space: ${formatBytes(selectedBytes)} selected, ${formatBytes(storage.freeBytes)} left.`
    if (files.some((f) => !f.error && !f.title.trim())) found.titles = 'Every file needs a title.'
    if (!versionOf) {
      if (!meta.category) found.category = 'Choose a category.'
      if (!meta.controls.length) found.controls = 'Link the evidence to at least one control.'
      if (meta.validUntil && new Date(meta.validUntil) < new Date()) found.validUntil = 'Date must be in the future.'
    }
    setErrors(found)
    return !Object.keys(found).length
  }

  const simulateProgress = () =>
    new Promise((resolve) => {
      const progress = Object.fromEntries(valid.map((f) => [f.id, 0]))
      const timer = setInterval(() => {
        Object.keys(progress).forEach((id) => {
          progress[id] = Math.min(100, progress[id] + 8 + Math.random() * 18)
        })
        setFiles((current) => current.map((f) => (f.id in progress ? { ...f, progress: progress[f.id] } : f)))
        if (Object.values(progress).every((p) => p >= 100)) {
          clearInterval(timer)
          setTimeout(resolve, 250)
        }
      }, 180)
    })

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setPhase('uploading')
    setServerError('')
    await simulateProgress()
    const name = getFullName(user) || 'You'
    try {
      if (versionOf) {
        const updated = await uploadNewVersion(versionOf, valid[0].file, note, name)
        setCreated([updated])
      } else {
        setCreated(await uploadEvidence(valid.map((f) => ({ ...meta, file: f.file, title: f.title })), name))
      }
      setPhase('done')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setFiles((list) => list.map((f) => ({ ...f, progress: 0 })))
      setPhase('select')
    }
  }

  if (phase === 'done') {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-xl rounded-xl border border-line bg-paper-dark p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent"><CheckCircle2 className="h-6 w-6" /></span>
          <h1 className="font-display text-2xl font-semibold text-ink">{versionOf ? 'New version uploaded' : `${created.length} file${created.length > 1 ? 's' : ''} uploaded`}</h1>
          <p className="mt-2 text-sm text-ink-soft">Submitted for review. A reviewer other than you will approve or reject {created.length > 1 ? 'them' : 'it'}.</p>
          <ul className="my-6 space-y-2 text-left">
            {created.map((c) => (
              <li key={c.id}>
                <Link to={`/evidence/${c.id}`} className="flex items-center gap-3 rounded-lg border border-line p-3 hover:border-accent/50">
                  <FileTypeIcon type={c.fileType} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink">{c.title}</span><span className="text-xs text-ink-soft">{c.id} · v{c.versions[0].version}</span></span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => navigate('/evidence')}>Back to library</Button>
            {!versionOf && <Button onClick={() => { setFiles([]); setCreated([]); setPhase('select') }}>Upload more</Button>}
          </div>
        </div>
      </DashboardShell>
    )
  }

  const uploading = phase === 'uploading'

  return (
    <DashboardShell>
      <PageHeader
        back={versionOf ? { to: `/evidence/${versionOf}`, label: 'Back to evidence' } : { to: '/evidence', label: 'Evidence library' }}
        eyebrow="Evidence & document management"
        title={versionOf ? 'Upload new version' : 'Upload evidence'}
        subtitle={versionOf
          ? target ? `Replaces the current file of ${target.id} · ${target.title}. Previous versions stay in the history.` : 'Loading evidence…'
          : `Up to ${MAX_FILES_PER_UPLOAD} files at once, ${MAX_FILE_MB} MB each. One upload can cover several controls.`}
      />

      {target === false && <Alert variant="error">The evidence you are trying to update was not found.</Alert>}
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <SectionCard title={versionOf ? '1. Select the new file' : '1. Select files'}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && inputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) addFiles(e.dataTransfer.files) }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center ${
                dragging ? 'border-accent bg-accent-soft' : errors.files ? 'border-danger/60' : 'border-line hover:border-accent/50'
              }`}
            >
              <UploadCloud className="mb-3 h-8 w-8 text-accent" />
              <p className="text-sm text-ink">Drag and drop {versionOf ? 'a file' : 'files'} here, or <span className="font-semibold text-accent">browse</span></p>
              <p className="mt-1 text-xs text-ink-soft">Max {MAX_FILE_MB} MB per file{versionOf ? '' : ` · up to ${MAX_FILES_PER_UPLOAD} files`}</p>
              <input ref={inputRef} type="file" multiple={!versionOf} accept={ACCEPTED_EXTENSIONS.map((x) => `.${x}`).join(',')} className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </div>
            {errors.files && <p className="mt-2 text-xs text-danger">{errors.files}</p>}

            <div className="mt-4 space-y-3 rounded-lg border border-line bg-paper p-3">
              <AcceptedFormats />
              {storage && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
                  <span className="text-ink-soft">Storage: <span className="font-mono text-ink">{formatBytes(storage.usedBytes)}</span> of {formatBytes(storage.limitBytes)} used</span>
                  <span className={overQuota ? 'text-danger' : 'text-ink-soft'}>
                    Selected <span className="font-mono text-ink">{formatBytes(selectedBytes)}</span> · {formatBytes(storage.freeBytes)} free
                  </span>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f) => (
                  <li key={f.id} className={`rounded-lg border p-3 ${f.error ? 'border-danger/40 bg-danger-soft' : 'border-line bg-paper'}`}>
                    <div className="flex items-center gap-3">
                      <FileTypeIcon type={extensionOf(f.file.name)} />
                      <div className="min-w-0 flex-1">
                        {f.error || versionOf ? (
                          <p className="truncate text-sm text-ink">{f.file.name}</p>
                        ) : (
                          <input value={f.title} disabled={uploading} aria-label={`Title for ${f.file.name}`}
                            onChange={(e) => setFiles((list) => list.map((x) => (x.id === f.id ? { ...x, title: e.target.value } : x)))}
                            className="w-full border-0 border-b border-transparent bg-transparent p-0 text-sm text-ink outline-none focus:border-accent" style={{ background: 'transparent' }} />
                        )}
                        <p className={`text-xs ${f.error ? 'text-danger' : 'text-ink-soft'}`}>
                          {f.error ? <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {f.error}</span> : `${f.file.name} · ${formatBytes(f.file.size)}`}
                        </p>
                      </div>
                      {!uploading && (
                        <button type="button" onClick={() => setFiles((list) => list.filter((x) => x.id !== f.id))} className="rounded p-1 text-ink-soft hover:text-danger cursor-pointer" aria-label={`Remove ${f.file.name}`}>
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {!f.error && (uploading || f.progress > 0) && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${f.progress}%` }} /></div>
                        <span className="w-10 text-right font-mono text-[11px] text-ink-soft">{Math.round(f.progress)}%</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {errors.titles && <p className="mt-2 text-xs text-danger">{errors.titles}</p>}
          </SectionCard>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={versionOf ? '2. What changed?' : '2. Details'}>
            {versionOf ? (
              <div>
                <label htmlFor="note" className={labelClass}>Version note</label>
                <textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} disabled={uploading}
                  placeholder="e.g. Added the red-team annex requested by the reviewer" className={inputClass} />
                <p className="mt-2 text-xs text-ink-soft">The new version goes back to review. Linked controls stay the same.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className={labelClass}>Category</label>
                  <select id="category" value={meta.category} onChange={setField('category')} disabled={uploading}
                    className={`${inputClass} cursor-pointer ${errors.category ? 'border-danger' : ''}`}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-1.5 text-xs text-danger">{errors.category}</p>}
                </div>
                <div>
                  <span className={labelClass}>Linked controls</span>
                  <ControlPicker value={meta.controls} onChange={(controls) => { setMeta((m) => ({ ...m, controls })); setErrors((er) => ({ ...er, controls: undefined })) }} error={errors.controls} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="conf" className={labelClass}>Confidentiality</label>
                    <select id="conf" value={meta.confidentiality} onChange={setField('confidentiality')} disabled={uploading} className={`${inputClass} cursor-pointer`}>
                      {CONFIDENTIALITY.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <TextField label="Valid until" type="date" value={meta.validUntil} onChange={setField('validUntil')} error={errors.validUntil} disabled={uploading} />
                </div>
                <div>
                  <label htmlFor="desc" className={labelClass}>Description (optional)</label>
                  <textarea id="desc" rows={3} value={meta.description} onChange={setField('description')} disabled={uploading}
                    placeholder="What does this evidence prove?" className={inputClass} />
                </div>
              </div>
            )}
          </SectionCard>

          <Button type="submit" fullWidth loading={uploading} disabled={versionOf && !target}>
            {!uploading && <FileUp className="h-4 w-4" />}
            {uploading ? 'Uploading…' : versionOf ? 'Upload new version' : `Upload ${valid.length || ''} file${valid.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </form>
    </DashboardShell>
  )
}

export default UploadEvidencePage
