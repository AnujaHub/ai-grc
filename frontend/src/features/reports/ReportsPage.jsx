import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Gauge, CalendarClock, FilePlus2, Eye, Download, Sparkles } from 'lucide-react'
import { genererRapport, telechargerRapport, visualiserRapport } from '../../services/reportService'
import { peutEditer } from '../../utils/permissions'
import { toast } from '../../utils/toast'
import useTable from '../../utils/useTable'
import { Alert, Button, EmptyState, FilterBar, PageHeader, Pagination, SearchInput, SelectFilter, SortableHeader } from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'
import KpiCard from '../dashboard/components/KpiCard'
import SectionCard from '../dashboard/components/SectionCard'
import ProgressBar from '../dashboard/components/ProgressBar'
import { scoreTone, timeAgo } from '../dashboard/utils/format'
import { SCORE_BANDS, loadReports, scoreBand } from './reportsData'

const value = (row, key) => (key === 'generatedAt' ? new Date(row.generatedAt).getTime() : key === 'score' ? row.score ?? -1 : row[key])

function GenerateReport({ reportable, onGenerated }) {
  const [evaluationId, setEvaluationId] = useState('')
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    setBusy(true)
    try {
      await genererRapport(evaluationId)
      toast('Report generated.')
      setEvaluationId('')
      onGenerated()
    } catch (err) {
      toast(err.response?.data?.detail ? `Report generation failed: ${err.response.data.detail}` : 'Report generation failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionCard title="Generate a report" subtitle="Create a PDF compliance report from a completed assessment">
      {reportable.length === 0 ? (
        <p className="text-sm text-ink-soft">No completed assessments yet. <Link to="/assessments" className="text-accent hover:underline">Complete an assessment</Link> to generate its report.</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={evaluationId} onChange={(e) => setEvaluationId(e.target.value)} aria-label="Completed assessment"
            className="flex-1 border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer">
            <option value="">Choose a completed assessment…</option>
            {reportable.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <Button onClick={generate} loading={busy} disabled={!evaluationId}>{!busy && <FilePlus2 className="h-4 w-4" />} Generate PDF</Button>
        </div>
      )}
    </SectionCard>
  )
}

function ReportsPage() {
  const navigate = useNavigate()
  const editable = peutEditer()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [filters, setFilters] = useState({ search: '', band: '', kind: '' })

  useEffect(() => {
    let active = true
    loadReports()
      .then((result) => active && setData(result))
      .catch(() => active && setError('Unable to load reports. Make sure the backend is running.'))
    return () => {
      active = false
    }
  }, [reloadKey])

  const filtered = useMemo(() => (data?.rows || []).filter((r) =>
    (!filters.search || `${r.target} ${r.organisation} ${r.framework}`.toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.band || scoreBand(r.score) === filters.band) &&
    (!filters.kind || r.kind === filters.kind),
  ), [data, filters])
  const { rows, sort, onSort, pagination, resetPage } = useTable(filtered, { pageSize: 10, initialSort: { key: 'generatedAt', dir: 'desc' }, getValue: value })
  const set = (key) => (v) => {
    setFilters((f) => ({ ...f, [key]: v }))
    resetPage()
  }
  const head = (label, key, cls) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} />

  const act = async (fn, id, failMessage) => {
    setBusyId(id)
    try {
      await fn(id)
    } catch {
      toast(failMessage, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const scored = (data?.rows || []).filter((r) => r.score !== null)
  const average = scored.length ? Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length) : null
  const latest = (data?.rows || []).reduce((max, r) => (!max || new Date(r.generatedAt) > new Date(max) ? r.generatedAt : max), null)

  return (
    <DashboardShell>
      <PageHeader eyebrow="Reports & audit" title="Reports" subtitle="Compliance reports generated from completed assessments."
        actions={<Link to="/ai?tab=summaries"><Button variant="secondary"><Sparkles className="h-4 w-4" /> AI summaries</Button></Link>} />

      {error ? <Alert variant="error">{error}</Alert> : !data ? <DashboardSkeleton /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard icon={FileText} label="Reports" value={data.rows.length} tone="info" />
            <KpiCard icon={Gauge} label="Average score" value={average ?? '—'} suffix={average !== null ? '%' : ''} delay={0.05} />
            <KpiCard icon={CalendarClock} label="Latest report" value={latest ? timeAgo(latest) : '—'} tone="warning" className="col-span-2 lg:col-span-1" delay={0.1} />
          </div>

          {editable && <GenerateReport reportable={data.reportable} onGenerated={() => setReloadKey((k) => k + 1)} />}

          <FilterBar resultCount={filtered.length} showReset={Object.values(filters).some(Boolean)} onReset={() => { setFilters({ search: '', band: '', kind: '' }); resetPage() }}>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Search target, organization, framework…" className="sm:w-80" />
            <SelectFilter label="Score" value={filters.band} onChange={set('band')} options={SCORE_BANDS} />
            <SelectFilter label="Scope" value={filters.kind} onChange={set('kind')} options={[{ value: 'system', label: 'AI system' }, { value: 'organization', label: 'Organization-wide' }]} />
          </FilterBar>

          <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
            {filtered.length === 0 ? (
              <EmptyState icon={FileText} title={data.rows.length ? 'No reports match your filters' : 'No reports yet'} message={data.rows.length ? 'Try different filters.' : 'Generate a report from a completed assessment.'} />
            ) : (
              <>
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-soft">
                      {head('Target', 'target', 'px-5 py-3')}
                      {head('Organization', 'organisation', 'px-3 py-3')}
                      {head('Framework', 'framework', 'px-3 py-3')}
                      {head('Score', 'score', 'w-44 px-3 py-3')}
                      {head('Generated', 'generatedAt', 'px-3 py-3')}
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} onClick={() => navigate(`/reports/${r.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper">
                        <td className="px-5 py-3 text-ink">{r.target}</td>
                        <td className="px-3 py-3 text-ink-soft">{r.organisation}</td>
                        <td className="px-3 py-3 text-ink-soft">{r.framework}</td>
                        <td className="px-3 py-3">
                          {r.score !== null ? (
                            <div className="flex items-center gap-2"><ProgressBar value={r.score} tone={scoreTone(r.score)} /><span className="w-12 text-right font-mono text-xs text-ink">{r.score}%</span></div>
                          ) : <span className="text-ink-soft">—</span>}
                        </td>
                        <td className="px-3 py-3 text-xs text-ink-soft">{new Date(r.generatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => act(visualiserRapport, r.id, 'Unable to open the report.')} aria-label="View PDF" title="View PDF" className="rounded p-1.5 text-ink-soft hover:text-accent cursor-pointer"><Eye className="h-4 w-4" /></button>
                            <button type="button" onClick={() => act(telechargerRapport, r.id, 'Download failed.')} disabled={busyId === r.id} aria-label="Download PDF" title="Download PDF" className="rounded p-1.5 text-ink-soft hover:text-accent disabled:opacity-40 cursor-pointer"><Download className="h-4 w-4" /></button>
                          </div>
                        </td>
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

export default ReportsPage
