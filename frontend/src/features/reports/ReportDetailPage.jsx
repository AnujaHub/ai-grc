import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, ExternalLink, Sparkles, FileText } from 'lucide-react'
import api from '../../services/api'
import { telechargerRapport, visualiserRapport } from '../../services/reportService'
import { getEvaluationDetail } from '../../services/evaluationService'
import { getChapitres } from '../../services/frameworkService'
import { displayLabel } from '../../utils/displayLabels'
import { toast } from '../../utils/toast'
import { Alert, Button, EmptyState, PageHeader, StatusBadge } from '../../components/ui'
import ComplianceBadge from '../../components/ComplianceBadge'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'
import SectionCard from '../dashboard/components/SectionCard'
import ProgressBar from '../dashboard/components/ProgressBar'
import { loadReports } from './reportsData'

const ANSWERS = [
  { value: 'Conforme', tone: 'accent' },
  { value: 'Partiellement conforme', tone: 'warning' },
  { value: 'Non conforme', tone: 'danger' },
  { value: 'Non applicable', tone: 'info' },
]

function PdfPreview({ reportId }) {
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl = null
    api.get(`/rapports/${reportId}/telecharger`, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        if (active) setUrl(objectUrl)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [reportId])

  if (failed) return <EmptyState icon={FileText} title="Preview not available" message="The PDF could not be loaded. Try downloading it instead." />
  if (!url) return <div className="h-[560px] animate-pulse rounded-lg bg-paper" />
  return <iframe title="Report preview" src={url} className="h-[640px] w-full rounded-lg border border-line bg-white" />
}

function ReportDetailPage() {
  const id = Number(useParams().id)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    loadReports()
      .then(async ({ rows }) => {
        const report = rows.find((r) => r.id === id)
        if (!report) throw new Error('missing')
        const evaluation = await getEvaluationDetail(report.evaluationId).catch(() => null)
        const chapters = evaluation ? await getChapitres(evaluation.referentiel_id).catch(() => []) : []
        const titles = Object.fromEntries(chapters.flatMap((c) => c.clauses.map((cl) => [cl.id, `${cl.numero} ${cl.titre}`])))
        if (active) setData({ report, evaluation, titles })
      })
      .catch(() => active && setError('Report not found, or the backend is not reachable.'))
    return () => {
      active = false
    }
  }, [id])

  if (error || !data) {
    return (
      <DashboardShell>
        <PageHeader back={{ to: '/reports', label: 'Reports' }} title="Report" />
        {error ? <Alert variant="error">{error}</Alert> : <DashboardSkeleton />}
      </DashboardShell>
    )
  }

  const { report, evaluation, titles } = data
  const answers = evaluation?.reponses || []
  const answered = answers.filter((a) => a.reponse)
  const gaps = answered.filter((a) => a.reponse === 'Non conforme' || a.reponse === 'Partiellement conforme')

  const download = () => telechargerRapport(report.id).catch(() => toast('Download failed.', 'error'))
  const open = () => visualiserRapport(report.id).catch(() => toast('Unable to open the report.', 'error'))

  return (
    <DashboardShell>
      <PageHeader
        back={{ to: '/reports', label: 'Reports' }}
        crumb={report.target}
        eyebrow={`${report.framework} · ${report.organisation}`}
        title={report.target}
        subtitle={`Generated ${new Date(report.generatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
        actions={
          <>
            <Button variant="secondary" onClick={open}><ExternalLink className="h-4 w-4" /> Open in new tab</Button>
            <Button onClick={download}><Download className="h-4 w-4" /> Download PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Preview" subtitle={report.fileName} className="lg:col-span-2">
          <PdfPreview reportId={report.id} />
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Result">
            <div className="flex items-center gap-4">
              {report.score !== null && <ComplianceBadge score={report.score} taille={96} />}
              <dl className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-soft">Questions answered</dt><dd className="font-mono text-ink">{answered.length}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">Gaps</dt><dd className="font-mono text-ink">{gaps.length}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">Scope</dt><dd className="text-ink">{report.kind === 'organization' ? 'Organization-wide' : 'AI system'}</dd></div>
              </dl>
            </div>
            {evaluation && (
              <Link to={`/assessments/${report.evaluationId}`} className="mt-4 inline-block text-xs font-medium text-accent hover:underline">Open the assessment →</Link>
            )}
          </SectionCard>

          <SectionCard title="Answer breakdown">
            {answered.length === 0 ? <p className="text-sm text-ink-soft">No answers available.</p> : (
              <ul className="space-y-3">
                {ANSWERS.map((a) => {
                  const n = answered.filter((x) => x.reponse === a.value).length
                  return (
                    <li key={a.value}>
                      <div className="mb-1 flex justify-between text-sm"><span className="text-ink">{displayLabel(a.value)}</span><span className="font-mono text-ink-soft">{n}</span></div>
                      <ProgressBar value={(n / answered.length) * 100} tone={a.tone} />
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="AI summary">
            <p className="flex items-start gap-2 text-sm text-ink-soft"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" /> AI-generated summaries of reports are reviewed in AI insights before they are shared.</p>
            <Link to="/ai?tab=summaries" className="mt-3 inline-block text-xs font-medium text-accent hover:underline">Open AI report summaries →</Link>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Gaps found" subtitle="Questions answered non-compliant or partially compliant" bodyClassName="p-0">
        {gaps.length === 0 ? <EmptyState title="No gaps" message="Every answered question is compliant or not applicable." /> : (
          <ul className="divide-y divide-line">
            {gaps.map((g) => (
              <li key={g.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="flex-1 text-sm text-ink">{titles[g.clause_id] || 'Question'}</span>
                {g.commentaire && <span className="text-xs italic text-ink-soft sm:max-w-xs sm:truncate">“{g.commentaire}”</span>}
                <StatusBadge status={g.reponse === 'Non conforme' ? 'overdue' : 'pending'} label={displayLabel(g.reponse)} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </DashboardShell>
  )
}

export default ReportDetailPage
