import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, FilePlus2, FolderOpen, ScrollText, Files, Hourglass, CheckCircle2, CalendarX2, Pencil, ShieldCheck } from 'lucide-react'
import { Button, EmptyState, FilterBar, PageHeader, Pagination, SearchInput, SelectFilter, SortableHeader, StatusBadge, Tabs } from '../../components/ui'
import useTable from '../../utils/useTable'
import DashboardState from '../dashboard/components/DashboardState'
import KpiCard from '../dashboard/components/KpiCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { daysUntil, formatDate, timeAgo } from '../dashboard/utils/format'
import { canEdit, getCurrentUser } from '../../utils/roles'
import ProgressBar from '../dashboard/components/ProgressBar'
import { DOMAINS, listControls } from '../controls/controlsData'
import { CATEGORIES, COVERAGE_OPTIONS, EVIDENCE_STATUSES, evidenceCoverage, getStorage, listEvidence, listPolicies, formatBytes } from './evidenceData'
import { ControlChips, FileTypeIcon, StorageUsage } from './components'

const loadLibrary = async () => {
  const [evidence, policies, storage, controls] = await Promise.all([listEvidence(), listPolicies(), getStorage(), listControls()])
  return { evidence, policies, storage, controls: controls.map((c) => ({ ...c, coverage: evidenceCoverage(c.code), evidenceCount: evidence.filter((e) => e.controls.includes(c.code)).length })) }
}

const evidenceValue = (row, key) => {
  if (key === 'uploadedAt') return new Date(row.uploadedAt).getTime()
  if (key === 'controls') return row.controls.length
  return row[key]
}

const coverageRank = { missing: 0, pending: 1, approved: 2 }
const coverageValue = (row, key) => (key === 'coverage' ? coverageRank[row.coverage] : key === 'code' ? row.code.replace(/\d+/g, (d) => d.padStart(3, '0')) : row[key])

const policyValue = (row, key) => (key === 'nextReview' ? (row.nextReview ? new Date(row.nextReview).getTime() : null) : row[key])

const EMPTY = { search: '', category: '', status: '', type: '' }

function EvidenceTable({ items }) {
  const navigate = useNavigate()
  const { rows, sort, onSort, pagination } = useTable(items, { pageSize: 8, initialSort: { key: 'uploadedAt', dir: 'desc' }, getValue: evidenceValue })
  const head = (label, key, align) => <SortableHeader as="span" label={label} sortKey={key} sort={sort} onSort={onSort} align={align} />
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-dark">
      <div className="hidden grid-cols-[1fr_8rem_8rem_7rem_9rem_5rem] gap-3 border-b border-line px-5 py-3 text-xs text-ink-soft lg:grid">
        {head('Evidence', 'title')}{head('Category', 'category')}{head('Controls', 'controls')}{head('Status', 'status')}{head('Uploaded', 'uploadedAt')}{head('Size', 'sizeBytes', 'right')}
      </div>
      <ul className="divide-y divide-line">
        {rows.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => navigate(`/evidence/${e.id}`)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 text-left hover:bg-paper cursor-pointer lg:grid-cols-[1fr_8rem_8rem_7rem_9rem_5rem]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <FileTypeIcon type={e.fileType} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{e.title}</span>
                  <span className="block truncate text-xs text-ink-soft">{e.id} · {e.fileName} · v{e.versions[0].version}</span>
                </span>
              </span>
              <span className="hidden text-xs text-ink-soft lg:block">{e.category}</span>
              <span className="hidden lg:block"><ControlChips codes={e.controls} max={2} /></span>
              <span className="justify-self-end lg:justify-self-start"><StatusBadge status={e.status} /></span>
              <span className="hidden text-xs text-ink-soft lg:block">{e.uploadedBy}<span className="block">{timeAgo(e.uploadedAt)}</span></span>
              <span className="hidden text-right font-mono text-xs text-ink-soft lg:block">{formatBytes(e.sizeBytes)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Pagination {...pagination} />
    </div>
  )
}

function PolicyTable({ items, editable }) {
  const { rows, sort, onSort, pagination } = useTable(items, { pageSize: 10, getValue: policyValue })
  const head = (label, key, cls) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} />
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
            {head('Document', 'title', 'px-5 py-3')}
            {head('Owner', 'owner', 'px-3 py-3')}
            {head('Version', 'version', 'px-3 py-3')}
            {head('Status', 'status', 'px-3 py-3')}
            {head('Next review', 'nextReview', 'px-3 py-3')}
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const reviewDue = p.nextReview && daysUntil(p.nextReview) < 0
            return (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300"><ScrollText className="h-4 w-4" /></span>
                    <div>
                      <p className="text-ink">{p.title}</p>
                      <p className="text-xs text-ink-soft">{p.id} · {p.category} · updated {timeAgo(p.updatedAt)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-ink-soft">{p.owner}</td>
                <td className="px-3 py-3 font-mono text-ink">{p.version}</td>
                <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                <td className={`px-3 py-3 text-xs ${reviewDue ? 'text-danger' : 'text-ink-soft'}`}>
                  {p.nextReview ? formatDate(p.nextReview) : '—'}
                  {reviewDue && <span className="block">Review overdue</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/evidence/documents/${p.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                    <Pencil className="h-3.5 w-3.5" /> {editable && p.status !== 'approved' ? 'Edit' : 'Open'}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  )
}

const COVERAGE_BADGE = {
  approved: { status: 'approved', label: 'Approved' },
  pending: { status: 'pending', label: 'Awaiting approval' },
  missing: { status: 'missing', label: 'No evidence', tone: 'danger' },
}

function CoverageView({ controls, editable }) {
  const [filters, setFilters] = useState({ search: '', coverage: '', theme: '' })
  const total = controls.length
  const count = (c) => controls.filter((x) => x.coverage === c).length
  const approved = count('approved')
  const q = filters.search.trim().toLowerCase()
  const filtered = controls.filter((c) =>
    (!q || `${c.code} ${c.title} ${c.owner}`.toLowerCase().includes(q)) &&
    (!filters.coverage || c.coverage === filters.coverage) &&
    (!filters.theme || c.domainCode === filters.theme),
  )
  const { rows, sort, onSort, pagination, resetPage } = useTable(filtered, { pageSize: 15, getValue: coverageValue })
  const head = (label, key, cls, align) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} align={align} />
  const set = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    resetPage()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-paper-dark p-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">Every control needs at least one approved evidence</p>
          <p className="font-mono text-sm text-ink">{approved} <span className="text-ink-soft">/ {total} controls covered</span></p>
        </div>
        <ProgressBar value={(approved / total) * 100} />
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <button type="button" onClick={() => set('coverage')('approved')} className="text-accent hover:underline cursor-pointer">{approved} approved</button>
          <button type="button" onClick={() => set('coverage')('pending')} className="text-warning hover:underline cursor-pointer">{count('pending')} awaiting approval</button>
          <button type="button" onClick={() => set('coverage')('missing')} className="text-danger hover:underline cursor-pointer">{count('missing')} with no evidence</button>
        </div>
      </div>

      <FilterBar resultCount={filtered.length} showReset={Boolean(filters.search || filters.coverage || filters.theme)} onReset={() => setFilters({ search: '', coverage: '', theme: '' })}>
        <SearchInput value={filters.search} onChange={set('search')} placeholder="Search control or owner…" className="sm:w-72" />
        <SelectFilter label="Coverage" value={filters.coverage} onChange={set('coverage')} options={COVERAGE_OPTIONS} />
        <SelectFilter label="Theme" value={filters.theme} onChange={set('theme')} options={DOMAINS.map((d) => ({ value: d.code, label: `${d.code} ${d.name}` }))} />
      </FilterBar>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              {head('Control', 'code', 'px-5 py-3')}
              {head('Owner', 'owner', 'px-3 py-3')}
              {head('Files', 'evidenceCount', 'px-3 py-3', 'right')}
              {head('Evidence', 'coverage', 'px-3 py-3')}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const badge = COVERAGE_BADGE[c.coverage]
              return (
                <tr key={c.code} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5">
                    <Link to={`/controls/${c.code}`} className="hover:text-accent">
                      <span className="mr-2 font-mono text-xs text-accent">{c.code}</span>
                      <span className="text-ink">{c.title}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-ink-soft">{c.owner}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-ink">{c.evidenceCount}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={badge.status} label={badge.label} tone={badge.tone} /></td>
                  <td className="px-5 py-2.5 text-right">
                    {editable && c.coverage !== 'approved' && (
                      <Link to={`/evidence/upload?control=${c.code}`} className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                        <Upload className="h-3.5 w-3.5" /> Upload
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>
    </div>
  )
}

function EvidenceLibraryPage() {
  const [params, setParams] = useSearchParams()
  const tab = ['documents', 'coverage'].includes(params.get('tab')) ? params.get('tab') : 'evidence'
  const editable = canEdit(getCurrentUser())
  const { data, loading, error, reload } = useDashboardData(loadLibrary)
  const [filters, setFilters] = useState(EMPTY)
  const [policySearch, setPolicySearch] = useState('')
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }))

  const evidence = useMemo(() => {
    if (!data) return []
    const q = filters.search.trim().toLowerCase()
    return data.evidence
      .filter((e) =>
        (!q || [e.id, e.title, e.fileName, e.description, e.uploadedBy, ...e.controls].some((v) => v.toLowerCase().includes(q))) &&
        (!filters.category || e.category === filters.category) &&
        (!filters.status || e.status === filters.status) &&
        (!filters.type || e.fileType === filters.type),
      )
  }, [data, filters])

  const policies = useMemo(
    () => (data ? data.policies.filter((p) => !policySearch || `${p.title} ${p.owner} ${p.id}`.toLowerCase().includes(policySearch.toLowerCase())) : []),
    [data, policySearch],
  )

  const expiringSoon = data ? data.evidence.filter((e) => e.status === 'expired' || (e.validUntil && daysUntil(e.validUntil) <= 30)).length : 0
  const fileTypes = data ? [...new Set(data.evidence.map((e) => e.fileType))].map((t) => ({ value: t, label: t.toUpperCase() })) : []
  const filtering = filters.search || filters.category || filters.status || filters.type

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <PageHeader
            eyebrow="Evidence & document management"
            title="Evidence library"
            subtitle="Every proof, report and policy linked to the controls it supports."
            actions={editable && (
              <>
                <Link to="/evidence/documents/new"><Button variant="secondary"><FilePlus2 className="h-4 w-4" /> New document</Button></Link>
                <Link to="/evidence/upload"><Button><Upload className="h-4 w-4" /> Upload evidence</Button></Link>
              </>
            )}
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard icon={Files} label="Evidence files" value={data.evidence.length} tone="info" />
            <KpiCard icon={Hourglass} label="Awaiting review" value={data.evidence.filter((e) => e.status === 'in_review').length} tone="warning" delay={0.05} />
            <KpiCard icon={CheckCircle2} label="Approved" value={data.evidence.filter((e) => e.status === 'approved').length} delay={0.1} />
            <KpiCard icon={CalendarX2} label="Expired / expiring" value={expiringSoon} tone="danger" hint="within 30 days" delay={0.15} />
          </div>

          <StorageUsage storage={data.storage} />

          <Tabs
            active={tab}
            onChange={(id) => setParams(id === 'evidence' ? {} : { tab: id })}
            tabs={[
              { id: 'evidence', label: 'Evidence', icon: FolderOpen, count: data.evidence.length },
              { id: 'coverage', label: 'Control coverage', icon: ShieldCheck, count: `${data.controls.filter((c) => c.coverage === 'approved').length}/${data.controls.length}` },
              { id: 'documents', label: 'Policy documents', icon: ScrollText, count: data.policies.length },
            ]}
          />

          {tab === 'coverage' && <CoverageView controls={data.controls} editable={editable} />}
          {tab === 'evidence' && (
            <>
              <FilterBar resultCount={evidence.length} showReset={Boolean(filtering)} onReset={() => setFilters(EMPTY)}>
                <SearchInput value={filters.search} onChange={set('search')} placeholder="Search title, file, control…" className="sm:w-72" />
                <SelectFilter label="Category" value={filters.category} onChange={set('category')} options={CATEGORIES} />
                <SelectFilter label="Status" value={filters.status} onChange={set('status')} options={EVIDENCE_STATUSES} />
                <SelectFilter label="Type" value={filters.type} onChange={set('type')} options={fileTypes} />
              </FilterBar>
              {evidence.length ? <EvidenceTable key={JSON.stringify(filters)} items={evidence} /> : (
                <div className="rounded-xl border border-line bg-paper-dark">
                  <EmptyState title="No evidence found" message="Change the filters or upload a new file." action={editable && <Link to="/evidence/upload"><Button>Upload evidence</Button></Link>} />
                </div>
              )}
            </>
          )}
          {tab === 'documents' && (
            <>
              <FilterBar resultCount={policies.length}>
                <SearchInput value={policySearch} onChange={setPolicySearch} placeholder="Search documents…" className="sm:w-72" />
              </FilterBar>
              {policies.length ? <PolicyTable items={policies} editable={editable} /> : (
                <div className="rounded-xl border border-line bg-paper-dark"><EmptyState title="No documents found" /></div>
              )}
            </>
          )}
        </>
      )}
    </DashboardState>
  )
}

export default EvidenceLibraryPage
