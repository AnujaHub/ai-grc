import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  getPreuvesPourReponse as getEvidenceForResponse,
  uploadPreuve as uploadEvidence,
  supprimerPreuve as deleteEvidence,
  analyserPreuve as analyzeEvidence,
} from '../services/preuveService'

const VERDICT_COLORS = {
  'Pertinente': 'bg-accent-soft text-accent',
  'Insuffisante': 'bg-warning-soft text-warning',
  'Non liée': 'bg-danger-soft text-danger',
  'Relevant': 'bg-accent-soft text-accent',
  'Insufficient': 'bg-warning-soft text-warning',
  'Not related': 'bg-danger-soft text-danger',
}

const VERDICT_LABELS = {
  Pertinente: 'Relevant',
  Insuffisante: 'Insufficient',
  'Non liée': 'Not related',
}

function EvidenceManager({ responseId }) {
  const [evidence, setEvidence] = useState([])
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [analysisInProgress, setAnalysisInProgress] = useState(null)

  const loadEvidence = async () => {
    try {
      const data = await getEvidenceForResponse(responseId)
      setEvidence(data)
    } catch {
      setError('Unable to load evidence')
    }
  }

  useEffect(() => {
    if (!responseId) return

    const loadInitialEvidence = async () => {
      try {
        const data = await getEvidenceForResponse(responseId)
        setEvidence(data)
      } catch {
        setError('Unable to load evidence')
      }
    }

    loadInitialEvidence()
  }, [responseId])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { alert('Choose a file before uploading'); return }
    try {
      await uploadEvidence(responseId, file, description)
      setFile(null); setDescription('')
      loadEvidence()
    } catch {
      setError('File upload failed (invalid format or size)')
    }
  }

  const handleDelete = async (evidenceId) => {
    if (!confirm('Delete this evidence?')) return
    try {
      await deleteEvidence(evidenceId)
      loadEvidence()
    } catch {
      alert('Evidence deletion failed')
    }
  }

  const handleAnalyze = async (evidenceId) => {
    setAnalysisInProgress(evidenceId)
    try {
      await analyzeEvidence(evidenceId)
      loadEvidence()
    } catch (err) {
      alert(err.response?.data?.detail || 'AI analysis failed')
    } finally {
      setAnalysisInProgress(null)
    }
  }

  const handleDownload = async (evidenceId, fileName) => {
    try {
      const response = await api.get(`/preuves/${evidenceId}/telecharger`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('Download failed')
    }
  }

  const canAnalyze = (fileType) => ['pdf', 'png', 'jpg', 'jpeg'].includes(fileType)

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">Documentary evidence</p>

      {error && <p className="text-danger text-xs mb-2">{error}</p>}

      {evidence.length > 0 && (
        <ul className="space-y-2 mb-3">
          {evidence.map((p) => (
            <li key={p.id} className="bg-paper border border-line px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink truncate">{p.file_name}</span>
                <span className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-mono text-xs text-ink-soft">{Math.round(p.taille / 1024)} KB</span>
                  {canAnalyze(p.file_type) && (
                    <button
                      onClick={() => handleAnalyze(p.id)}
                      disabled={analysisInProgress === p.id}
                      className="text-xs text-ink-soft hover:text-ink cursor-pointer disabled:opacity-50"
                    >
                      {analysisInProgress === p.id ? 'Analyzing...' : p.analyse_verdict ? 'Analyze again' : 'Analyze (AI)'}
                    </button>
                  )}
                  <button onClick={() => handleDownload(p.id, p.file_name)} className="text-xs text-accent hover:underline cursor-pointer">
                    Download
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-danger hover:underline cursor-pointer">
                    Delete
                  </button>
                </span>
              </div>

              {p.analyse_verdict && (
                <div className="mt-2 pt-2 border-t border-line/60">
                  <span className={`inline-block px-2 py-0.5 text-xs font-mono font-medium ${VERDICT_COLORS[p.analyse_verdict] || ''}`}>
                    {VERDICT_LABELS[p.analyse_verdict] || p.analyse_verdict}
                  </span>
                  <p className="text-ink-soft text-xs mt-1.5">{p.analyse_details}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap gap-2 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-xs text-ink-soft"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[160px] px-2 py-1.5 border border-line focus:border-accent outline-none text-xs bg-paper"
        />
        <button type="submit" className="px-3 py-1.5 border border-ink text-ink text-xs font-medium cursor-pointer hover:bg-ink hover:text-white">
          Add evidence
        </button>
      </form>
    </div>
  )
}

export default EvidenceManager