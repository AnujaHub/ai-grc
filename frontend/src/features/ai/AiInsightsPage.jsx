import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FileSearch, ShieldAlert, Lightbulb, FileText, Sparkles, ListTodo, TrendingUp } from 'lucide-react'
import { Alert, EmptyState, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { canEdit, getCurrentUser, getFullName } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { MODEL, getAiInsights, reviewAiItem } from './aiData'
import { AiCard, ReviewModal } from './components'

const TABS = [
  { id: 'evidence', label: 'Evidence analysis', icon: FileSearch },
  { id: 'risks', label: 'Risk suggestions', icon: ShieldAlert },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'summaries', label: 'Report summaries', icon: FileText },
]

const FILTERS = [
  { id: 'suggested', label: 'Needs review' },
  { id: 'accepted', label: 'Confirmed' },
  { id: 'dismissed', label: 'Dismissed' },
  { id: 'all', label: 'All' },
]

const ACCEPT_TEXT = {
  evidence: 'The analysis will be recorded as reviewed against this evidence.',
  risks: 'The risk will be marked as confirmed, ready to be added to the risk register.',
  recommendations: 'A task will be created in the GRC plan and assigned to you.',
  summaries: 'The summary will be marked as confirmed and can be shared with the report.',
}

const VERDICT = { relevant: { status: 'approved', label: 'Relevant evidence' }, insufficient: { status: 'pending', label: 'Insufficient' }, not_related: { status: 'rejected', label: 'Not related' } }
const SEVERITY = { high: 'text-danger', medium: 'text-warning', low: 'text-ink-soft' }

const ControlLinks = ({ codes }) => (
  <span className="flex flex-wrap gap-1">
    {codes.map((c) => <Link key={c} to={`/controls/${c}`} className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[11px] text-accent hover:border-accent/50">{c}</Link>)}
  </span>
)

function EvidenceAnalysis({ item }) {
  const verdict = VERDICT[item.verdict]
  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/evidence/${item.evidenceId}`} className="text-sm font-semibold text-ink hover:text-accent">{item.evidenceTitle}</Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft"><span className="font-mono">{item.evidenceId}</span> <ControlLinks codes={item.controls} /></p>
        </div>
        <StatusBadge status={verdict.status} label={verdict.label} />
      </div>
      <p className="text-sm text-ink">{item.summary}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Extracted information</p>
          <dl className="divide-y divide-line rounded-lg border border-line bg-paper px-3 text-sm">
            {item.extracted.map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-1.5"><dt className="text-ink-soft">{k}</dt><dd className="text-right text-ink">{v}</dd></div>)}
          </dl>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Findings</p>
          <ul className="space-y-2">
            {item.findings.map((f) => (
              <li key={f.text} className="flex gap-2 text-sm">
                <span className={`mt-0.5 font-mono text-[10px] uppercase ${SEVERITY[f.severity]}`}>{f.severity}</span>
                <span className="text-ink">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function RiskSuggestion({ item }) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{item.title}</p>
        <StatusBadge status={item.level} label={`${item.level === 'high' ? 'High' : item.level === 'medium' ? 'Medium' : 'Low'} risk`} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-soft">
        <span>Likelihood <span className="text-ink">{item.likelihood}</span></span>
        <span>Impact <span className="text-ink">{item.impact}</span></span>
        <span className="flex items-center gap-1.5">Controls <ControlLinks codes={item.controls} /></span>
      </div>
      <p className="text-sm text-ink"><span className="text-ink-soft">Why: </span>{item.rationale}</p>
      <p className="text-sm text-ink"><span className="text-ink-soft">Suggested treatment: </span>{item.treatment}</p>
      <p className="text-xs text-ink-soft">Source: {item.source}</p>
    </div>
  )
}

function Recommendation({ item }) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-ink">
          <Link to={`/controls/${item.control}`} className="mr-2 font-mono text-xs text-accent hover:underline">{item.control}</Link>
          <span className="font-semibold">{item.controlTitle}</span>
        </p>
        <div className="flex gap-1.5"><StatusBadge status={item.priority} /><StatusBadge status="not_started" label={`${item.effort} effort`} /></div>
      </div>
      <p className="text-sm text-ink"><span className="text-ink-soft">Gap: </span>{item.gap}</p>
      <p className="text-sm text-ink"><span className="text-ink-soft">Recommended action: </span>{item.recommendation}</p>
      <p className="inline-flex items-center gap-1.5 text-xs text-accent"><TrendingUp className="h-3.5 w-3.5" /> Estimated +{item.scoreGain} points on the compliance score</p>
      {item.taskId && (
        <Link to={`/grc-plan/tasks/${item.taskId}`} className="ml-4 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"><ListTodo className="h-3.5 w-3.5" /> Task {item.taskId}</Link>
      )}
    </div>
  )
}

function ReportSummary({ item }) {
  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{item.reportTitle}</p>
          <p className="text-xs text-ink-soft">Score in report: <span className="font-mono text-ink">{item.score}%</span></p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-ink">{item.summary}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Key findings</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink">{item.keyFindings.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Strengths</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink">{item.strengths.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

const BODY = { evidence: EvidenceAnalysis, risks: RiskSuggestion, recommendations: Recommendation, summaries: ReportSummary }
const titleOf = (kind, item) => ({ evidence: item.evidenceTitle, risks: item.title, recommendations: `${item.control} ${item.controlTitle}`, summaries: item.reportTitle }[kind])

function AiInsightsPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'evidence'
  const { data, loading, error, reload, setData } = useDashboardData(getAiInsights)
  const [filter, setFilter] = useState('suggested')
  const [review, setReview] = useState(null)
  const user = getCurrentUser()
  const reviewer = canEdit(user)

  const confirmReview = async (note) => {
    const updated = await reviewAiItem(tab, review.item.id, review.decision, { actor: getFullName(user) || 'You', note })
    setData((d) => ({ ...d, [tab]: d[tab].map((x) => (x.id === updated.id ? updated : x)) }))
    toast(review.decision === 'accepted'
      ? (tab === 'recommendations' ? `Accepted. Task ${updated.taskId} created in the GRC plan.` : 'Suggestion accepted and recorded with your name.')
      : 'Suggestion dismissed.', review.decision === 'accepted' ? 'success' : 'info')
    setReview(null)
  }

  const Body = BODY[tab]
  const items = data ? data[tab].filter((x) => filter === 'all' || x.status === filter) : []

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <PageHeader eyebrow="AI interfaces" title="AI insights" subtitle="Findings and suggestions generated by AI. Nothing here takes effect until a person reviews and accepts it." />
          <Alert variant="info">
            <span className="inline-flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
              <span>Generated by {MODEL}. AI can be wrong or incomplete. Items marked <span className="text-violet-300">AI suggestion</span> are unreviewed; items marked <span className="text-accent">Confirmed</span> were checked and accepted by the named person.</span>
            </span>
          </Alert>

          <Tabs active={tab} onChange={(id) => setParams(id === 'evidence' ? {} : { tab: id })}
            tabs={TABS.map((t) => ({ ...t, count: data[t.id].filter((x) => x.status === 'suggested').length }))} />

          <div className="inline-flex rounded-lg border border-line bg-paper p-0.5">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
                className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer ${filter === f.id ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}>
                {f.label} <span className="font-mono">{f.id === 'all' ? data[tab].length : data[tab].filter((x) => x.status === f.id).length}</span>
              </button>
            ))}
          </div>

          {!reviewer && <Alert variant="info">Read-only access. You can see AI output but not accept or dismiss it.</Alert>}

          {items.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper-dark">
              <EmptyState icon={Sparkles} title={filter === 'suggested' ? 'Nothing waiting for review' : 'Nothing here yet'} message="New AI output appears here as evidence is analysed and assessments are completed." />
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <AiCard key={item.id} item={item} canReview={reviewer} acceptLabel={tab === 'recommendations' ? 'Accept & create task' : tab === 'risks' ? 'Confirm risk' : 'Accept'}
                  onReview={(it, decision) => setReview({ item: it, decision, title: titleOf(tab, it), acceptText: ACCEPT_TEXT[tab] })}>
                  <Body item={item} />
                </AiCard>
              ))}
            </div>
          )}

          <ReviewModal review={review} onClose={() => setReview(null)} onConfirm={confirmReview} />
        </>
      )}
    </DashboardState>
  )
}

export default AiInsightsPage
