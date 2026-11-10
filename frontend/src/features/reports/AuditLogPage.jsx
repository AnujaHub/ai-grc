import { useEffect, useMemo, useState } from 'react'
import { Download, History, Eye } from 'lucide-react'
import { getJournalAudit } from '../../services/auditLogService'
import { toast } from '../../utils/toast'
import useTable from '../../utils/useTable'
import { Alert, Button, EmptyState, FilterBar, Modal, PageHeader, Pagination, SearchInput, SelectFilter, SortableHeader, StatusBadge } from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'

const ACTIONS = {
  connexion: { label: 'Sign-in', tone: 'neutral' },
  creation: { label: 'Created', tone: 'accent' },
  modification: { label: 'Updated', tone: 'warning' },
  finalisation: { label: 'Completed', tone: 'accent' },
  suppression: { label: 'Deleted', tone: 'danger' },
}

const RESOURCES = { Organisation: 'Organization', Evaluation: 'Assessment', Risque: 'Risk', Utilisateur: 'User', Preuve: 'Evidence', Rapport: 'Report' }

const resourceLabel = (type) => RESOURCES[type] || type
const actionLabel = (action) => ACTIONS[action]?.label || action
const value = (row, key) => (key === 'action_date' ? new Date(row.action_date).getTime() : key === 'user' ? row.utilisateur_email || 'System' : row[key])
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

const toCsv = (rows) => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['Date', 'User', 'Action', 'Resource', 'Resource ID', 'Details']
  const lines = rows.map((e) => [new Date(e.action_date).toISOString(), e.utilisateur_email || 'System', actionLabel(e.action), resourceLabel(e.ressource_type), e.ressource_id, e.details].map(escape).join(','))
  return [header.map(escape).join(','), ...lines].join('\n')
}

function AuditLogPage() {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', resource: '', action: '', from: '', to: '' })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let active = true
    getJournalAudit()
      .then((data) => active && setEntries(data))
      .catch(() => active && setError('Unable to load the audit log. This page is limited to administrators and auditors.'))
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => (entries || []).filter((e) => {
    const q = filters.search.trim().toLowerCase()
    const at = new Date(e.action_date)
    return (!q || `${e.utilisateur_email || 'system'} ${e.details || ''} ${e.ressource_id || ''}`.toLowerCase().includes(q)) &&
      (!filters.resource || e.ressource_type === filters.resource) &&
      (!filters.action || e.action === filters.action) &&
      (!filters.from || at >= new Date(`${filters.from}T00:00:00`)) &&
      (!filters.to || at <= new Date(`${filters.to}T23:59:59`))
  }), [entries, filters])
  const { rows, sort, onSort, pagination, resetPage } = useTable(filtered, { pageSize: 20, initialSort: { key: 'action_date', dir: 'desc' }, getValue: value })
  const set = (key) => (v) => {
    setFilters((f) => ({ ...f, [key]: v }))
    resetPage()
  }
  const head = (label, key, cls) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} />

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast(`${filtered.length} events exported.`)
  }

  const resourceTypes = [...new Set((entries || []).map((e) => e.ressource_type))]
  const actionTypes = [...new Set((entries || []).map((e) => e.action))]

  return (
    <DashboardShell>
      <PageHeader eyebrow="Reports & audit" title="Audit log" subtitle="A read-only history of who did what, and when."
        actions={entries && <Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}><Download className="h-4 w-4" /> Export CSV</Button>} />

      {error ? <Alert variant="error">{error}</Alert> : !entries ? <DashboardSkeleton /> : (
        <>
          <FilterBar resultCount={filtered.length} showReset={Object.values(filters).some(Boolean)} onReset={() => { setFilters({ search: '', resource: '', action: '', from: '', to: '' }); resetPage() }}>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Search user, details or ID…" className="sm:w-64" />
            <SelectFilter label="Resource" value={filters.resource} onChange={set('resource')} options={resourceTypes.map((t) => ({ value: t, label: resourceLabel(t) }))} />
            <SelectFilter label="Action" value={filters.action} onChange={set('action')} options={actionTypes.map((a) => ({ value: a, label: actionLabel(a) }))} />
            <label className="flex items-center gap-2 text-xs text-ink-soft">From
              <input type="date" value={filters.from} onChange={(e) => set('from')(e.target.value)} className="border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent" />
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-soft">To
              <input type="date" value={filters.to} onChange={(e) => set('to')(e.target.value)} className="border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent" />
            </label>
          </FilterBar>

          <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
            {filtered.length === 0 ? <EmptyState icon={History} title="No events found" message="Change the filters or the date range." /> : (
              <>
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-soft">
                      {head('Date', 'action_date', 'px-5 py-3')}
                      {head('User', 'user', 'px-3 py-3')}
                      {head('Action', 'action', 'px-3 py-3')}
                      {head('Resource', 'ressource_type', 'px-3 py-3')}
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Details</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e.id} onClick={() => setSelected(e)} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper">
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs text-ink-soft">{formatDateTime(e.action_date)}</td>
                        <td className="px-3 py-2.5 text-ink">{e.utilisateur_email || 'System'}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={e.action} label={actionLabel(e.action)} tone={ACTIONS[e.action]?.tone} /></td>
                        <td className="px-3 py-2.5 text-ink-soft">{resourceLabel(e.ressource_type)}</td>
                        <td className="max-w-xs truncate px-3 py-2.5 text-xs text-ink-soft">{e.details || '—'}</td>
                        <td className="px-5 py-2.5 text-right"><Eye className="ml-auto h-4 w-4 text-ink-soft" /></td>
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

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Audit event" subtitle={selected && formatDateTime(selected.action_date)}>
        {selected && (
          <dl className="divide-y divide-line text-sm">
            {[
              ['Event ID', <span key="id" className="font-mono text-xs">{selected.id}</span>],
              ['User', selected.utilisateur_email || 'System'],
              ['User ID', <span key="uid" className="font-mono text-xs">{selected.utilisateur_id || '—'}</span>],
              ['Action', actionLabel(selected.action)],
              ['Resource', resourceLabel(selected.ressource_type)],
              ['Resource ID', <span key="rid" className="font-mono text-xs">{selected.ressource_id || '—'}</span>],
              ['Date', formatDateTime(selected.action_date)],
              ['Details', selected.details || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-2.5"><dt className="shrink-0 text-ink-soft">{k}</dt><dd className="break-all text-right text-ink">{v}</dd></div>
            ))}
          </dl>
        )}
      </Modal>
    </DashboardShell>
  )
}

export default AuditLogPage
