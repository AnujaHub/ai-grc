import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, Hourglass, CheckCircle2, Gauge, Cpu, Building2, Play, ListChecks } from 'lucide-react'
import { getEvaluations, createEvaluation } from '../services/evaluationService'
import { getSystemesIA } from '../services/aiSystemService'
import { getReferentiels } from '../services/frameworkService'
import { getOrganisations } from '../services/organizationService'
import { peutEditer } from '../utils/permissions'
import { toast } from '../utils/toast'
import useTable from '../utils/useTable'
import { Alert, Button, EmptyState, FilterBar, PageHeader, Pagination, SearchInput, SelectFilter, SortableHeader, StatusBadge } from '../components/ui'
import DashboardShell from '../features/dashboard/components/DashboardShell'
import DashboardSkeleton from '../features/dashboard/components/DashboardSkeleton'
import KpiCard from '../features/dashboard/components/KpiCard'
import SectionCard from '../features/dashboard/components/SectionCard'
import ProgressBar from '../features/dashboard/components/ProgressBar'
import { scoreTone } from '../features/dashboard/utils/format'

const STATUS_MAP = { 'En cours': 'in_progress', Terminée: 'completed' }
const STATUS_OPTIONS = [
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

const selectClass = 'w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'

const rowValue = (row, key) => (key === 'score' ? row.score ?? -1 : row[key])

function NewAssessment({ systemes, organizations, referentiels, onCreate }) {
  const [type, setType] = useState('Systeme_IA')
  const [targetId, setTargetId] = useState('')
  const [referentielId, setReferentielId] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const targets = type === 'Systeme_IA' ? systemes : organizations

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!targetId) found.target = type === 'Systeme_IA' ? 'Choose an AI system.' : 'Choose an organization.'
    if (!referentielId) found.referentiel = 'Choose a reference framework.'
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    await onCreate(type, referentielId, type === 'Systeme_IA' ? targetId : null, type === 'Organisation' ? targetId : null)
    setBusy(false)
  }

  return (
    <SectionCard title="Start a new assessment" subtitle="Assess an AI system or the organization's governance against a framework">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="inline-flex rounded-lg border border-line bg-paper p-1" role="radiogroup" aria-label="Assessment type">
          {[{ v: 'Systeme_IA', l: 'Specific AI system', Icon: Cpu }, { v: 'Organisation', l: 'Organization-wide', Icon: Building2 }].map(({ v, l, Icon }) => (
            <button key={v} type="button" role="radio" aria-checked={type === v}
              onClick={() => { setType(v); setTargetId(''); setErrors({}) }}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm cursor-pointer ${type === v ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}>
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-start">
          <div>
            <label htmlFor="target" className={labelClass}>{type === 'Systeme_IA' ? 'AI system' : 'Organization'}</label>
            <select id="target" value={targetId} onChange={(e) => { setTargetId(e.target.value); setErrors((er) => ({ ...er, target: undefined })) }}
              className={`${selectClass} ${errors.target ? 'border-danger' : ''}`}>
              <option value="">Select…</option>
              {targets.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
            {errors.target && <p className="mt-1.5 text-xs text-danger">{errors.target}</p>}
            {targets.length === 0 && <p className="mt-1.5 text-xs text-ink-soft">None available yet.</p>}
          </div>
          <div>
            <label htmlFor="framework" className={labelClass}>Reference framework</label>
            <select id="framework" value={referentielId} onChange={(e) => { setReferentielId(e.target.value); setErrors((er) => ({ ...er, referentiel: undefined })) }}
              className={`${selectClass} ${errors.referentiel ? 'border-danger' : ''}`}>
              <option value="">Select…</option>
              {referentiels.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
            {errors.referentiel && <p className="mt-1.5 text-xs text-danger">{errors.referentiel}</p>}
          </div>
          <Button type="submit" loading={busy} className="md:mt-[1.4rem]">
            {!busy && <Play className="h-4 w-4" />} Create and start
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}

function Assessments() {
  const navigate = useNavigate()
  const authorized = peutEditer()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', status: '' })

  useEffect(() => {
    let active = true
    Promise.all([getEvaluations(), getSystemesIA(), getReferentiels(), getOrganisations()])
      .then(([evaluations, systemes, referentiels, organizations]) => active && setData({ evaluations, systemes, referentiels, organizations }))
      .catch(() => active && setError('Unable to load assessment data. Make sure the backend is running.'))
    return () => {
      active = false
    }
  }, [])

  const rows = useMemo(() => {
    if (!data) return []
    const name = (list, id) => list.find((x) => x.id === id)?.nom
    return data.evaluations.map((ev) => ({
      id: ev.id,
      target: ev.evaluation_type === 'Organisation' ? name(data.organizations, ev.organisation_id) || 'Unknown organization' : name(data.systemes, ev.systeme_ia_id) || 'Unknown AI system',
      kind: ev.evaluation_type === 'Organisation' ? 'Organization-wide' : 'AI system',
      framework: name(data.referentiels, ev.referentiel_id) || 'Unknown',
      status: STATUS_MAP[ev.statut] || 'not_started',
      score: ev.score,
      started: ev.start_date,
    }))
  }, [data])

  const filtered = rows.filter((r) =>
    (!filters.search || `${r.target} ${r.framework}`.toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.status || r.status === filters.status),
  )
  const { rows: pageRows, sort, onSort, pagination, resetPage } = useTable(filtered, { pageSize: 10, initialSort: { key: 'started', dir: 'desc' }, getValue: rowValue })
  const set = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    resetPage()
  }
  const head = (label, key, cls, align) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} align={align} />

  const handleCreate = async (...args) => {
    try {
      const created = await createEvaluation(...args)
      toast('Assessment created.')
      navigate(`/assessments/${created.id}`)
    } catch (err) {
      toast(err.response?.data?.detail || 'Assessment creation failed.', 'error')
    }
  }

  const completed = rows.filter((r) => r.status === 'completed')
  const average = completed.length ? Math.round(completed.reduce((s, r) => s + (r.score || 0), 0) / completed.length) : null

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Controls & compliance"
        title="Compliance assessments"
        subtitle="Measure governance maturity against your selected framework."
        actions={<Link to="/controls"><Button variant="secondary"><ListChecks className="h-4 w-4" /> Controls catalogue</Button></Link>}
      />

      {error ? (
        <Alert variant="error">{error}</Alert>
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard icon={ClipboardList} label="Assessments" value={rows.length} tone="info" />
            <KpiCard icon={Hourglass} label="In progress" value={rows.filter((r) => r.status === 'in_progress').length} tone="warning" delay={0.05} />
            <KpiCard icon={CheckCircle2} label="Completed" value={completed.length} delay={0.1} />
            <KpiCard icon={Gauge} label="Average score" value={average ?? '—'} suffix={average !== null ? '%' : ''} hint="of completed" delay={0.15} />
          </div>

          {authorized && <NewAssessment systemes={data.systemes} organizations={data.organizations} referentiels={data.referentiels} onCreate={handleCreate} />}

          <FilterBar resultCount={filtered.length} showReset={Boolean(filters.search || filters.status)} onReset={() => { setFilters({ search: '', status: '' }); resetPage() }}>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Search target or framework…" className="sm:w-72" />
            <SelectFilter label="Status" value={filters.status} onChange={set('status')} options={STATUS_OPTIONS} />
          </FilterBar>

          <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
            {filtered.length === 0 ? (
              <EmptyState icon={ClipboardList} title={rows.length ? 'No assessments match your filters' : 'No assessments yet'}
                message={rows.length ? 'Try a different search or clear the filters.' : authorized ? 'Start one with the form above.' : 'Assessments will appear here once they are created.'} />
            ) : (
              <>
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-soft">
                      {head('Target', 'target', 'px-5 py-3')}
                      {head('Framework', 'framework', 'px-3 py-3')}
                      {head('Status', 'status', 'px-3 py-3')}
                      {head('Score', 'score', 'w-44 px-3 py-3')}
                      {head('Started', 'started', 'px-3 py-3')}
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.id} onClick={() => navigate(`/assessments/${r.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper">
                        <td className="px-5 py-3">
                          <p className="text-ink">{r.target}</p>
                          <p className="text-xs text-ink-soft">{r.kind}</p>
                        </td>
                        <td className="px-3 py-3 text-ink-soft">{r.framework}</td>
                        <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-3 py-3">
                          {r.score !== null && r.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <ProgressBar value={r.score} tone={scoreTone(r.score)} />
                              <span className="w-12 text-right font-mono text-xs text-ink">{r.score}%</span>
                            </div>
                          ) : <span className="text-ink-soft">—</span>}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-ink-soft">{r.started}</td>
                        <td className="px-5 py-3 text-right text-xs font-medium text-accent">Open →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination {...pagination} />
              </>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  )
}

export default Assessments
