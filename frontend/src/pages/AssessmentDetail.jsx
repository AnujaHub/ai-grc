import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Sparkles, FileDown, Save, Paperclip } from 'lucide-react'
import ComplianceBadge from '../components/ComplianceBadge'
import EvidenceManagement from '../components/EvidenceManager'
import ComplianceSimulator from '../components/ComplianceSimulator'
import { getEvaluationDetail, repondreAClause, finaliserEvaluation } from '../services/evaluationService'
import { getChapitres } from '../services/frameworkService'
import { genererRisquesIA } from '../services/riskService'
import { genererRapport } from '../services/reportService'
import { peutEditer } from '../utils/permissions'
import { displayLabel } from '../utils/displayLabels'
import { toast } from '../utils/toast'
import { Alert, Button, ConfirmDialog, PageHeader, StatusBadge } from '../components/ui'
import DashboardShell from '../features/dashboard/components/DashboardShell'
import DashboardSkeleton from '../features/dashboard/components/DashboardSkeleton'
import ProgressBar from '../features/dashboard/components/ProgressBar'

const OPTIONS_REPONSE = ['Conforme', 'Partiellement conforme', 'Non conforme', 'Non applicable']

const OPTION_STYLE = {
  Conforme: 'border-accent bg-accent-soft text-accent',
  'Partiellement conforme': 'border-warning bg-warning-soft text-warning',
  'Non conforme': 'border-danger bg-danger-soft text-danger',
  'Non applicable': 'border-ink-soft/60 bg-paper text-ink',
}

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'gaps', label: 'Gaps' },
]

const STATUS_MAP = { 'En cours': 'in_progress', Terminée: 'completed' }

function ClauseCard({ clause, saved, draft, authorized, responseId, onChange, onSave }) {
  const [saving, setSaving] = useState(false)
  const dirty = draft && (draft.reponse !== (saved?.reponse || '') || (draft.commentaire || '') !== (saved?.commentaire || ''))

  const save = async () => {
    setSaving(true)
    await onSave(clause.id)
    setSaving(false)
  }

  return (
    <div id={`clause-${clause.id}`} className="rounded-xl border border-line bg-paper-dark p-5">
      <div className="mb-2 flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">
          <span className="mr-2 font-mono text-xs text-accent">{clause.numero}</span>
          {clause.titre}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {clause.departement_suggere && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-soft">{clause.departement_suggere}</span>
          )}
          {saved?.reponse && <StatusBadge status="completed" label="Answered" />}
        </div>
      </div>
      {clause.description && <p className="mb-4 text-sm text-ink-soft">{clause.description}</p>}

      <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`Answer for ${clause.numero}`}>
        {OPTIONS_REPONSE.map((option) => {
          const selected = draft?.reponse === option
          return (
            <button key={option} type="button" role="radio" aria-checked={selected} disabled={!authorized}
              onClick={() => onChange(clause.id, 'reponse', option)}
              className={`rounded-lg border px-3 py-1.5 text-sm cursor-pointer disabled:cursor-default ${selected ? OPTION_STYLE[option] : 'border-line text-ink-soft hover:border-accent/50 hover:text-ink disabled:hover:border-line disabled:hover:text-ink-soft'}`}>
              {displayLabel(option)}
            </button>
          )
        })}
      </div>

      {authorized ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Comment (optional)"
            aria-label={`Comment for ${clause.numero}`}
            value={draft?.commentaire || ''}
            onChange={(e) => onChange(clause.id, 'commentaire', e.target.value)}
            className="flex-1 border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <Button onClick={save} loading={saving} disabled={!draft?.reponse || !dirty} variant={dirty ? 'primary' : 'secondary'}>
            {!saving && <Save className="h-4 w-4" />} {dirty ? 'Save' : 'Saved'}
          </Button>
        </div>
      ) : (
        saved?.commentaire && <p className="text-sm italic text-ink-soft">“{saved.commentaire}”</p>
      )}

      {responseId ? (
        <EvidenceManagement responseId={responseId} />
      ) : (
        <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-xs text-ink-soft">
          <Paperclip className="h-3.5 w-3.5" /> Save an answer to attach evidence to this question.
        </p>
      )}
    </div>
  )
}

function AssessmentDetail() {
  const { evaluationId } = useParams()
  const authorized = peutEditer()
  const [evaluation, setEvaluation] = useState(null)
  const [chapitres, setChapitres] = useState([])
  const [reponses, setReponses] = useState({})
  const [error, setError] = useState('')
  const [view, setView] = useState('all')
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [reportBusy, setReportBusy] = useState(false)

  const load = useCallback(async () => {
    const evalData = await getEvaluationDetail(evaluationId)
    const chapitresData = await getChapitres(evalData.referentiel_id)
    const initial = {}
    evalData.reponses.forEach((r) => {
      initial[r.clause_id] = { reponse: r.reponse || '', commentaire: r.commentaire || '' }
    })
    return { evalData, chapitresData, initial }
  }, [evaluationId])

  const apply = ({ evalData, chapitresData, initial }) => {
    setEvaluation(evalData)
    setChapitres(chapitresData)
    setReponses(initial)
  }

  useEffect(() => {
    let active = true
    load()
      .then((result) => active && apply(result))
      .catch(() => active && setError('Unable to load the assessment. Make sure the backend is running.'))
    return () => {
      active = false
    }
  }, [load])

  const handleChange = (clauseId, field, value) => {
    setReponses((prev) => ({ ...prev, [clauseId]: { ...prev[clauseId], [field]: value } }))
  }

  const handleSave = async (clauseId) => {
    const draft = reponses[clauseId]
    if (!draft?.reponse) {
      toast('Select an answer before saving.', 'warning')
      return
    }
    try {
      await repondreAClause(evaluationId, clauseId, draft.reponse, draft.commentaire || '')
      const result = await load()
      setEvaluation(result.evalData)
      setReponses((prev) => ({ ...prev, [clauseId]: result.initial[clauseId] }))
      toast('Answer saved.')
    } catch {
      toast('Save failed. Please try again.', 'error')
    }
  }

  const handleFinish = async () => {
    try {
      setEvaluation(await finaliserEvaluation(evaluationId))
      toast('Assessment completed and score calculated.')
    } catch (err) {
      toast(err.response?.data?.detail || 'Completion failed.', 'error')
    } finally {
      setConfirmFinish(false)
    }
  }

  const handleAiRisks = async () => {
    setAiBusy(true)
    try {
      const result = await genererRisquesIA(evaluationId)
      toast(`AI suggestion: ${result.message} Review them in the risk register before accepting.`, 'info')
    } catch (err) {
      toast(err.response?.data?.detail || 'AI risk generation failed.', 'error')
    } finally {
      setAiBusy(false)
    }
  }

  const handleReport = async () => {
    setReportBusy(true)
    try {
      await genererRapport(evaluationId)
      toast('Report generated. Open Reports to download it.')
    } catch (err) {
      toast(err.response?.data?.detail ? `Report generation failed: ${err.response.data.detail}` : 'Report generation failed.', 'error')
    } finally {
      setReportBusy(false)
    }
  }

  if (error || !evaluation) {
    return (
      <DashboardShell>
        <PageHeader back={{ to: '/assessments', label: 'Assessments' }} title="Assessment" />
        {error ? <Alert variant="error">{error}</Alert> : <DashboardSkeleton />}
      </DashboardShell>
    )
  }

  const chapters = chapitres
    .map((ch) => ({ ...ch, clauses: ch.clauses.filter((c) => c.evaluation_type === evaluation.evaluation_type) }))
    .filter((ch) => ch.clauses.length)
  const savedFor = (clauseId) => evaluation.reponses.find((r) => r.clause_id === clauseId)
  const allClauses = chapters.flatMap((ch) => ch.clauses)
  const answered = allClauses.filter((c) => savedFor(c.id)?.reponse).length
  const counts = OPTIONS_REPONSE.map((o) => ({ option: o, n: allClauses.filter((c) => savedFor(c.id)?.reponse === o).length }))
  const done = evaluation.statut === 'Terminée'

  const matchesView = (clause) => {
    const r = savedFor(clause.id)?.reponse
    if (view === 'unanswered') return !r
    if (view === 'gaps') return r === 'Non conforme' || r === 'Partiellement conforme'
    return true
  }
  const visibleChapters = chapters.map((ch) => ({ ...ch, clauses: ch.clauses.filter(matchesView) })).filter((ch) => ch.clauses.length)

  return (
    <DashboardShell>
      <PageHeader
        back={{ to: '/assessments', label: 'Assessments' }}
        eyebrow={evaluation.evaluation_type === 'Organisation' ? 'Organization-wide assessment' : 'AI system assessment'}
        title="Assessment questionnaire"
        badge={<StatusBadge status={STATUS_MAP[evaluation.statut] || 'not_started'} />}
        actions={
          <>
            {authorized && (
              <Button variant="secondary" onClick={handleAiRisks} loading={aiBusy}>
                {!aiBusy && <Sparkles className="h-4 w-4" />} {aiBusy ? 'Analysing…' : 'Suggest risks (AI)'}
              </Button>
            )}
            {done && (
              <Button variant="secondary" onClick={handleReport} loading={reportBusy}>
                {!reportBusy && <FileDown className="h-4 w-4" />} {reportBusy ? 'Generating…' : 'Generate PDF report'}
              </Button>
            )}
            {authorized && !done && (
              <Button onClick={() => setConfirmFinish(true)}><CheckCircle2 className="h-4 w-4" /> Complete and score</Button>
            )}
          </>
        }
      />

      {!authorized && <Alert variant="info">Read-only access. You can review answers and evidence but cannot change them.</Alert>}

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-paper-dark p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-ink">Progress</p>
            <p className="font-mono text-sm text-ink">{answered} <span className="text-ink-soft">/ {allClauses.length} answered</span></p>
          </div>
          <ProgressBar value={allClauses.length ? (answered / allClauses.length) * 100 : 0} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
            {counts.map(({ option, n }) => (
              <span key={option}>{displayLabel(option)} <span className="font-mono text-ink">{n}</span></span>
            ))}
          </div>
        </div>
        {evaluation.score !== null && evaluation.score !== undefined && <ComplianceBadge score={evaluation.score} taille={96} />}
      </div>

      <ComplianceSimulator reponses={evaluation.reponses} chapitresFiltres={chapters} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="Chapters" className="sticky top-6 space-y-1 rounded-xl border border-line bg-paper-dark p-3">
            <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft">Chapters</p>
            {chapters.map((ch) => {
              const total = ch.clauses.length
              const n = ch.clauses.filter((c) => savedFor(c.id)?.reponse).length
              return (
                <a key={ch.id} href={`#chapter-${ch.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-paper">
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-ink"><span className="mr-1 font-mono text-ink-soft">{ch.numero}</span>{ch.titre}</span>
                    <span className="shrink-0 font-mono text-ink-soft">{n}/{total}</span>
                  </span>
                  <span className="mt-1 block"><ProgressBar value={(n / total) * 100} tone={n === total ? 'accent' : 'info'} /></span>
                </a>
              )
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <div className="inline-flex rounded-lg border border-line bg-paper p-0.5">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" onClick={() => setView(v.id)} aria-pressed={view === v.id}
                className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer ${view === v.id ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}>
                {v.label}
              </button>
            ))}
          </div>

          {visibleChapters.length === 0 && (
            <div className="rounded-xl border border-line bg-paper-dark px-5 py-10 text-center text-sm text-ink-soft">
              {view === 'unanswered' ? 'Every question has an answer.' : view === 'gaps' ? 'No gaps: nothing is marked non-compliant or partially compliant.' : 'No questions in this assessment.'}
            </div>
          )}

          {visibleChapters.map((chapitre) => (
            <section key={chapitre.id} id={`chapter-${chapitre.id}`} className="scroll-mt-6 space-y-3">
              <h2 className="border-b border-line pb-2 font-display text-lg text-ink">
                <span className="mr-2 font-mono text-sm text-ink-soft">{chapitre.numero}</span>{chapitre.titre}
              </h2>
              {chapitre.clauses.map((clause) => (
                <ClauseCard
                  key={clause.id}
                  clause={clause}
                  saved={savedFor(clause.id)}
                  draft={reponses[clause.id]}
                  authorized={authorized}
                  responseId={savedFor(clause.id)?.id}
                  onChange={handleChange}
                  onSave={handleSave}
                />
              ))}
            </section>
          ))}

          <p className="text-xs text-ink-soft">
            Need the full control list? Open the <Link to="/controls" className="text-accent hover:underline">controls catalogue</Link> or the <Link to="/evidence" className="text-accent hover:underline">evidence library</Link>.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmFinish}
        tone="warning"
        title="Complete this assessment?"
        message={`${answered} of ${allClauses.length} questions are answered. Completing calculates the final compliance score from the saved answers.`}
        confirmLabel="Complete and score"
        onConfirm={handleFinish}
        onCancel={() => setConfirmFinish(false)}
      />
    </DashboardShell>
  )
}

export default AssessmentDetail
