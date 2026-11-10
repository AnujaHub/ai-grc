import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Hourglass, CheckCircle2, XCircle, Inbox, FileCheck2, ScrollText, UserPlus, ShieldAlert, KeyRound, FileWarning } from 'lucide-react'
import { EmptyState, FilterBar, PageHeader, Pagination, SearchInput, SelectFilter, SortableHeader, StatusBadge, Tabs } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import KpiCard from '../dashboard/components/KpiCard'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { timeAgo } from '../dashboard/utils/format'
import useTable from '../../utils/useTable'
import { getCurrentUser, getFullName } from '../../utils/roles'
import { APPROVAL_TYPES, listApprovals } from './approvalsData'

const TYPE_ICONS = {
  Evidence: FileCheck2,
  Policy: ScrollText,
  Registration: UserPlus,
  'Risk acceptance': ShieldAlert,
  'Access request': KeyRound,
  Exception: FileWarning,
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }
const value = (row, key) => (key === 'submittedAt' ? new Date(row.submittedAt).getTime() : key === 'priority' ? PRIORITY_RANK[row.priority] : row[key])

function ApprovalTable({ items, completed }) {
  const navigate = useNavigate()
  const me = getFullName(getCurrentUser())
  const { rows, sort, onSort, pagination } = useTable(items, { pageSize: 10, initialSort: completed ? { key: 'submittedAt', dir: 'desc' } : { key: 'priority', dir: 'asc' }, getValue: value })
  const head = (label, key, cls) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} />

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink-soft">
            {head('Request', 'title', 'px-5 py-3')}
            {head('Type', 'type', 'px-3 py-3')}
            {head('Requested by', 'requestedBy', 'px-3 py-3')}
            {head('Priority', 'priority', 'px-3 py-3')}
            {head(completed ? 'Decision' : 'Status', 'status', 'px-3 py-3')}
            {head('Submitted', 'submittedAt', 'px-5 py-3')}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const Icon = TYPE_ICONS[a.type] || Inbox
            return (
              <tr key={a.id} onClick={() => navigate(`/approvals/${a.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-ink-soft"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{a.title}</span>
                      <span className="font-mono text-xs text-ink-soft">{a.id}{a.requestedBy === me && ' · your request'}</span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-ink-soft">{a.type}</td>
                <td className="px-3 py-3 text-ink-soft">{a.requestedBy}</td>
                <td className="px-3 py-3"><StatusBadge status={a.priority} /></td>
                <td className="px-3 py-3"><StatusBadge status={a.status} />{completed && a.decidedBy && <span className="mt-0.5 block text-xs text-ink-soft">by {a.decidedBy}</span>}</td>
                <td className="px-5 py-3 text-xs text-ink-soft">{timeAgo(a.submittedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  )
}

function ApprovalsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'completed' ? 'completed' : 'pending'
  const { data, loading, error, reload } = useDashboardData(listApprovals)
  const [filters, setFilters] = useState({ search: '', type: '', priority: '' })
  const set = (key) => (v) => setFilters((f) => ({ ...f, [key]: v }))

  const items = useMemo(() => (data || []).filter((a) =>
    (tab === 'pending' ? a.status === 'pending' : a.status !== 'pending') &&
    (!filters.search || `${a.id} ${a.title} ${a.requestedBy}`.toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.type || a.type === filters.type) &&
    (!filters.priority || a.priority === filters.priority),
  ), [data, tab, filters])

  const count = (fn) => (data || []).filter(fn).length

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <PageHeader eyebrow="Approvals & notifications" title="Approval requests" subtitle="Evidence, policies, registrations, risk acceptances and access requests that need a decision." />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard icon={Hourglass} label="Pending" value={count((a) => a.status === 'pending')} tone="warning" />
            <KpiCard icon={ShieldAlert} label="High priority" value={count((a) => a.status === 'pending' && a.priority === 'high')} tone="danger" delay={0.05} />
            <KpiCard icon={CheckCircle2} label="Approved" value={count((a) => a.status === 'approved')} delay={0.1} />
            <KpiCard icon={XCircle} label="Rejected" value={count((a) => a.status === 'rejected')} tone="info" delay={0.15} />
          </div>
          <Tabs active={tab} onChange={(id) => setParams(id === 'pending' ? {} : { tab: id })} tabs={[
            { id: 'pending', label: 'Pending', icon: Hourglass, count: count((a) => a.status === 'pending') },
            { id: 'completed', label: 'Completed', icon: CheckCircle2, count: count((a) => a.status !== 'pending') },
          ]} />
          <FilterBar resultCount={items.length} showReset={Object.values(filters).some(Boolean)} onReset={() => setFilters({ search: '', type: '', priority: '' })}>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Search request or person…" className="sm:w-72" />
            <SelectFilter label="Type" value={filters.type} onChange={set('type')} options={APPROVAL_TYPES} />
            <SelectFilter label="Priority" value={filters.priority} onChange={set('priority')} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          </FilterBar>
          {items.length ? <ApprovalTable key={`${tab}-${JSON.stringify(filters)}`} items={items} completed={tab === 'completed'} /> : (
            <div className="rounded-xl border border-line bg-paper-dark">
              <EmptyState icon={Inbox} title={tab === 'pending' ? 'Nothing waiting for a decision' : 'No completed requests'} />
            </div>
          )}
        </>
      )}
    </DashboardState>
  )
}

export default ApprovalsPage
