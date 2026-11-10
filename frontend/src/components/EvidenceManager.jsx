import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Trash2, Sparkles, Upload, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react'
import api from '../services/api'
import {
  getPreuvesPourReponse as getEvidenceForResponse,
  uploadPreuve as uploadEvidence,
  supprimerPreuve as deleteEvidence,
  analyserPreuve as analyzeEvidence,
} from '../services/evidenceService'
import { peutEditer } from '../utils/permissions'
import { toast } from '../utils/toast'
import { Button, ConfirmDialog } from './ui'

const ACCEPTED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg']
const MAX_MB = 10

const VERDICTS = {
  Pertinente: { label: 'Relevant', cls: 'border-accent/30 bg-accent-soft text-accent' },
  Relevant: { label: 'Relevant', cls: 'border-accent/30 bg-accent-soft text-accent' },
  Insuffisante: { label: 'Insufficient', cls: 'border-warning/30 bg-warning-soft text-warning' },
  Insufficient: { label: 'Insufficient', cls: 'border-warning/30 bg-warning-soft text-warning' },
  'Non liée': { label: 'Not related', cls: 'border-danger/30 bg-danger-soft text-danger' },
  'Not related': { label: 'Not related', cls: 'border-danger/30 bg-danger-soft text-danger' },
}

const ICONS = { pdf: FileText, doc: FileText, docx: FileText, xls: FileSpreadsheet, xlsx: FileSpreadsheet, png: FileImage, jpg: FileImage, jpeg: FileImage }

const extensionOf = (name) => name.split('.').pop().toLowerCase()
const sizeLabel = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

function EvidenceManager({ responseId }) {
  const editable = peutEditer()
  const inputRef = useRef(null)
  const [evidence, setEvidence] = useState([])
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analysing, setAnalysing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = async () => {
    try {
      setEvidence(await getEvidenceForResponse(responseId))
    } catch {
      setError('Unable to load evidence.')
    }
  }

  useEffect(() => {
    if (!responseId) return undefined
    let active = true
    getEvidenceForResponse(responseId)
      .then((data) => active && setEvidence(data))
      .catch(() => active && setError('Unable to load evidence.'))
    return () => {
      active = false
    }
  }, [responseId])

  const pick = (selected) => {
    setError('')
    if (!selected) return setFile(null)
    if (!ACCEPTED.includes(extensionOf(selected.name))) return setError(`.${extensionOf(selected.name)} files are not accepted here. Use ${ACCEPTED.join(', ').toUpperCase()}.`)
    if (selected.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`)
    setFile(selected)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Choose a file first.')
    setUploading(true)
    try {
      await uploadEvidence(responseId, file, description)
      setFile(null)
      setDescription('')
      if (inputRef.current) inputRef.current.value = ''
      await reload()
      toast('Evidence uploaded.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed (check the file format and size).')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteEvidence(deleting.id)
      await reload()
      toast(`${deleting.file_name} deleted.`, 'info')
    } catch {
      toast('Evidence deletion failed.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleAnalyse = async (id) => {
    setAnalysing(id)
    try {
      await analyzeEvidence(id)
      await reload()
      toast('AI analysis finished. Review the suggestion before relying on it.', 'info')
    } catch (err) {
      toast(err.response?.data?.detail || 'AI analysis failed.', 'error')
    } finally {
      setAnalysing(null)
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/preuves/${id}/telecharger`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast('Download failed.', 'error')
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Evidence ({evidence.length})</p>
        <Link to="/evidence" className="text-xs text-accent hover:underline">Evidence library →</Link>
      </div>

      {evidence.length > 0 && (
        <ul className="mb-3 space-y-2">
          {evidence.map((p) => {
            const Icon = ICONS[p.file_type] || File
            const verdict = VERDICTS[p.analyse_verdict]
            return (
              <li key={p.id} className="rounded-lg border border-line bg-paper px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-ink-soft" />
                  <span className="min-w-0 flex-1 truncate text-ink">{p.file_name}</span>
                  <span className="font-mono text-xs text-ink-soft">{sizeLabel(p.taille)}</span>
                  {editable && ['pdf', 'png', 'jpg', 'jpeg'].includes(p.file_type) && (
                    <button type="button" onClick={() => handleAnalyse(p.id)} disabled={analysing === p.id}
                      className="inline-flex items-center gap-1 text-xs text-sky-300 hover:underline disabled:opacity-50 cursor-pointer">
                      <Sparkles className="h-3.5 w-3.5" /> {analysing === p.id ? 'Analysing…' : p.analyse_verdict ? 'Re-analyse' : 'Analyse (AI)'}
                    </button>
                  )}
                  <button type="button" onClick={() => handleDownload(p.id, p.file_name)} className="rounded p-1 text-ink-soft hover:text-accent cursor-pointer" aria-label={`Download ${p.file_name}`}>
                    <Download className="h-4 w-4" />
                  </button>
                  {editable && (
                    <button type="button" onClick={() => setDeleting(p)} className="rounded p-1 text-ink-soft hover:text-danger cursor-pointer" aria-label={`Delete ${p.file_name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {verdict && (
                  <div className="mt-2 rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-2">
                    <p className="mb-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-sky-300">
                      <Sparkles className="h-3 w-3" /> AI suggestion · not a confirmed decision
                      <span className={`rounded-full border px-2 py-0.5 normal-case tracking-normal ${verdict.cls}`}>{verdict.label}</span>
                    </p>
                    <p className="text-xs text-ink-soft">{p.analyse_details}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {editable && (
        <form onSubmit={handleUpload} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-ink-soft hover:border-accent/50">
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{file ? `${file.name} · ${sizeLabel(file.size)}` : `Choose a file (${ACCEPTED.join(', ').toUpperCase()}, max ${MAX_MB} MB)`}</span>
            <input ref={inputRef} type="file" accept={ACCEPTED.map((x) => `.${x}`).join(',')} className="hidden" onChange={(e) => pick(e.target.files[0])} />
          </label>
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Evidence description"
            className="border border-line px-3 py-2 text-xs text-ink outline-none focus:border-accent sm:w-52" />
          <Button type="submit" variant="secondary" loading={uploading} disabled={!file}>Add evidence</Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete evidence?"
        message={deleting ? `${deleting.file_name} will be permanently deleted from this answer.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default EvidenceManager
