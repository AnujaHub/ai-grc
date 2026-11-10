import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, ClipboardCheck, ListChecks, CheckCircle2, Clock3, AlertTriangle, CircleDashed, Paperclip } from 'lucide-react'
import { Button, EmptyState, FilterBar, PageHeader, SearchInput, SelectFilter, StatusBadge } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import KpiCard from '../dashboard/components/KpiCard'
import ProgressBar from '../dashboard/components/ProgressBar'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { dueLabel, dueTone, scoreTone } from '../dashboard/utils/format'
import { COVERAGE_OPTIONS, evidenceCoverage, evidenceForControl } from '../evidence/evidenceData'
import { CONTROL_STATUSES, DEPARTMENTS, DOMAINS, FRAMEWORK, TEAM, listControls } from './controlsData'

const EMPTY_FILTERS = { search: '', domain: '', status: '', department: '', owner: '', evidence: '' }

const compliancePercent = (items) => {
  const applicable = items.filter((c) => c.status !== 'not_applicable')
  return applicable.length ? Math.round((applicable.filter((c) => c.status === 'implemented').length / applicable.length) * 100) : 0
}

function ControlRow({ control, onOpen }) {
  const evidenceCount = evidenceForControl(control.code).length
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(control.code)}
        className="grid w-full grid-cols-[4rem_1fr_auto] items-center gap-3 px-5 py-3 text-left hover:bg-paper cursor-pointer md:grid-cols-[4rem_1fr_9rem_8rem_4rem_8rem]"
      >
        <span className="font-mono text-xs text-accent">{control.code}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm text-ink">{control.title}</span>
          <span className="block truncate text-xs text-ink-soft md:hidden">{control.owner} · {dueLabel(control.dueDate)}</span>
        </span>
        <span className="hidden truncate text-xs text-ink-soft md:block">{control.owner}</span>
        <span className={`hidden text-xs md:block ${control.status === 'implemented' ? 'text-ink-soft' : dueTone(control.dueDate)}`}>
          {control.status === 'implemented' || control.status === 'not_applicable' ? '—' : dueLabel(control.dueDate)}
        </span>
        <span className="hidden items-center gap-1 text-xs text-ink-soft md:flex">
          <Paperclip className="h-3.5 w-3.5" /> {evidenceCount}
        </span>
        <span className="justify-self-end"><StatusBadge status={control.status} /></span>
      </button>
    </li>
  )
}

function ControlsCataloguePage() {
  const navigate = useNavigate()
  const { data: controls, loading, error, reload } = useDashboardData(listControls)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [collapsed, setCollapsed] = useState({})

  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }))
  const filtering = Object.values(filters).some(Boolean)

  const filtered = useMemo(() => {
    if (!controls) return []
    const q = filters.search.trim().toLowerCase()
    return controls.filter((c) =>
      (!q || [c.code, c.title, c.description, c.owner, c.domain].some((v) => v.toLowerCase().includes(q))) &&
      (!filters.domain || c.domainCode === filters.domain) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.department || c.department === filters.department) &&
      (!filters.owner || c.owner === filters.owner) &&
      (!filters.evidence || evidenceCoverage(c.code) === filters.evidence),
    )
  }, [controls, filters])

  const groups = useMemo(
    () => DOMAINS.map((d) => ({ ...d, items: filtered.filter((c) => c.domainCode === d.code) })).filter((g) => g.items.length),
    [filtered],
  )

  const count = (status) => controls?.filter((c) => c.status === status).length ?? 0
  const allCollapsed = groups.every((g) => collapsed[g.code])
  const toggleAll = () => setCollapsed(allCollapsed ? {} : Object.fromEntries(groups.map((g) => [g.code, true])))

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {controls && (
        <>
          <PageHeader
            eyebrow="Controls & compliance"
            title="Controls catalogue"
            subtitle={`${FRAMEWORK.name} ${FRAMEWORK.annex}: ${controls.length} controls across ${DOMAINS.length} themes · ${controls.filter((c) => evidenceCoverage(c.code) === 'approved').length} of ${controls.length} have approved evidence.`}
            actions={<Link to="/assessments"><Button variant="secondary"><ClipboardCheck className="h-4 w-4" /> Assessments</Button></Link>}
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard icon={ListChecks} label="Compliance" value={compliancePercent(controls)} suffix="%" hint="of applicable controls" className="col-span-2 lg:col-span-1" />
            <KpiCard icon={CheckCircle2} label="Implemented" value={count('implemented')} delay={0.05} />
            <KpiCard icon={Clock3} label="In progress" value={count('in_progress')} tone="info" delay={0.1} />
            <KpiCard icon={CircleDashed} label="Not started" value={count('not_started')} tone="warning" delay={0.15} />
            <KpiCard icon={AlertTriangle} label="Overdue" value={count('overdue')} tone="danger" delay={0.2} />
          </div>

          <FilterBar resultCount={filtered.length} showReset={filtering} onReset={() => setFilters(EMPTY_FILTERS)}>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Search code, title, owner…" className="sm:w-72" />
            <SelectFilter label="Theme" value={filters.domain} onChange={set('domain')} options={DOMAINS.map((d) => ({ value: d.code, label: `${d.code} ${d.name}` }))} />
            <SelectFilter label="Status" value={filters.status} onChange={set('status')} options={CONTROL_STATUSES} />
            <SelectFilter label="Department" value={filters.department} onChange={set('department')} options={DEPARTMENTS} />
            <SelectFilter label="Owner" value={filters.owner} onChange={set('owner')} options={TEAM.map((m) => m.name)} />
            <SelectFilter label="Evidence" value={filters.evidence} onChange={set('evidence')} options={COVERAGE_OPTIONS} />
          </FilterBar>

          {groups.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper-dark">
              <EmptyState title="No controls match your filters" message="Try a different search term or clear the filters." action={<Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button type="button" onClick={toggleAll} className="text-xs font-medium text-accent hover:underline cursor-pointer">
                  {allCollapsed ? 'Expand all' : 'Collapse all'}
                </button>
              </div>
              {groups.map((group) => {
                const open = !collapsed[group.code]
                const score = compliancePercent(group.items)
                return (
                  <section key={group.code} className="overflow-hidden rounded-xl border border-line bg-paper-dark">
                    <button
                      type="button"
                      onClick={() => setCollapsed((c) => ({ ...c, [group.code]: open }))}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-paper cursor-pointer"
                    >
                      {open ? <ChevronDown className="h-4 w-4 text-ink-soft" /> : <ChevronRight className="h-4 w-4 text-ink-soft" />}
                      <span className="w-8 font-mono text-xs text-ink-soft">{group.code}</span>
                      <span className="flex-1 truncate text-sm font-semibold text-ink">{group.name}</span>
                      <span className="hidden text-xs text-ink-soft sm:inline">{group.items.length} controls</span>
                      <span className="hidden w-28 sm:block"><ProgressBar value={score} tone={scoreTone(score)} /></span>
                      <span className="w-10 text-right font-mono text-xs text-ink">{score}%</span>
                    </button>
                    {open && (
                      <ul className="divide-y divide-line border-t border-line">
                        {group.items.map((control) => (
                          <ControlRow key={control.code} control={control} onOpen={(code) => navigate(`/controls/${code}`)} />
                        ))}
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </DashboardState>
  )
}

export default ControlsCataloguePage
