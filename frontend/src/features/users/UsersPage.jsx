import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users as UsersIcon, UserPlus, ShieldCheck, Inbox } from 'lucide-react'
import { getUtilisateurs, creerUtilisateur, modifierUtilisateur } from '../../services/userService'
import { getOrganisations } from '../../services/organizationService'
import { getCurrentUser } from '../../utils/roles'
import { toast } from '../../utils/toast'
import useTable from '../../utils/useTable'
import {
  Alert, Button, ConfirmDialog, EmptyState, FilterBar, Modal, PageHeader, Pagination, PasswordField,
  SearchInput, SelectFilter, SortableHeader, StatusBadge, Tabs, TextField,
} from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'
import { initials } from '../dashboard/utils/format'
import { ROLE_OPTIONS, STATUS_OPTIONS, pendingRegistrations, roleLabel } from './usersData'
import RegistrationsPanel from './RegistrationsPanel'
import RolesPanel from './RolesPanel'

const EMPTY_USER = { prenom: '', nom: '', email: '', password: '', role: 'responsable_conformite', organisationId: '' }
const selectClass = 'w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent cursor-pointer'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'
const userValue = (row, key) => (key === 'name' ? `${row.prenom} ${row.nom}` : key === 'created' ? new Date(row.creation_date).getTime() : row[key])

function CreateUserModal({ open, onClose, organizations, onCreated }) {
  const [form, setForm] = useState(EMPTY_USER)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }
  const close = () => {
    setForm(EMPTY_USER)
    setErrors({})
    onClose()
  }

  const submit = async () => {
    const found = {}
    if (!form.prenom.trim()) found.prenom = 'Required.'
    if (!form.nom.trim()) found.nom = 'Required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'Enter a valid email.'
    if (form.password.length < 8) found.password = 'At least 8 characters.'
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await creerUtilisateur({ nom: form.nom, prenom: form.prenom, email: form.email, mot_de_passe: form.password, role: form.role, organisation_id: form.organisationId || null })
      toast(`${form.prenom} ${form.nom} added.`)
      onCreated()
      close()
    } catch (err) {
      setErrors({ email: err.response?.data?.detail || 'Creation failed. The email may already be in use.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Add user" subtitle="The user can sign in straight away with this password."
      footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={submit} loading={busy}>Add user</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="First name" value={form.prenom} onChange={set('prenom')} error={errors.prenom} />
          <TextField label="Last name" value={form.nom} onChange={set('nom')} error={errors.nom} />
        </div>
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <PasswordField label="Temporary password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-role" className={labelClass}>Role</label>
            <select id="new-role" value={form.role} onChange={set('role')} className={selectClass}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="new-org" className={labelClass}>Organization</label>
            <select id="new-org" value={form.organisationId} onChange={set('organisationId')} className={selectClass}>
              <option value="">None</option>
              {organizations.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function UsersTab() {
  const me = getCurrentUser()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [filters, setFilters] = useState({ search: '', role: '', status: '', organisation: '' })
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getUtilisateurs(), getOrganisations()])
      .then(([users, organizations]) => active && setData({ users, organizations }))
      .catch(() => active && setError('Unable to load users. Make sure the backend is running and you are an administrator.'))
    return () => {
      active = false
    }
  }, [reloadKey])

  const orgName = (id) => data?.organizations.find((o) => o.id === id)?.nom || '—'
  const q = filters.search.trim().toLowerCase()
  const filtered = useMemo(() => (data?.users || []).filter((u) =>
    (!q || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q)) &&
    (!filters.role || u.role === filters.role) &&
    (!filters.status || u.statut === filters.status) &&
    (!filters.organisation || u.organisation_id === filters.organisation),
  ), [data, q, filters])
  const { rows, sort, onSort, pagination, resetPage } = useTable(filtered, { pageSize: 10, initialSort: { key: 'name', dir: 'asc' }, getValue: userValue })
  const set = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    resetPage()
  }
  const head = (label, key, cls) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} />

  const applyChange = async () => {
    try {
      await modifierUtilisateur(pending.user.id, { [pending.field]: pending.value })
      toast(`${pending.user.prenom} ${pending.user.nom}: ${pending.field === 'role' ? `role changed to ${roleLabel(pending.value)}` : `account ${pending.value === 'actif' ? 'activated' : 'deactivated'}`}.`)
      setReloadKey((k) => k + 1)
    } catch {
      toast('Update failed.', 'error')
    } finally {
      setPending(null)
    }
  }

  if (error) return <Alert variant="error">{error}</Alert>
  if (!data) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      <FilterBar resultCount={filtered.length} showReset={Object.values(filters).some(Boolean)} onReset={() => { setFilters({ search: '', role: '', status: '', organisation: '' }); resetPage() }}>
        <SearchInput value={filters.search} onChange={set('search')} placeholder="Search name or email…" className="sm:w-64" />
        <SelectFilter label="Role" value={filters.role} onChange={set('role')} options={[{ value: 'super_admin', label: 'Super admin' }, ...ROLE_OPTIONS]} />
        <SelectFilter label="Status" value={filters.status} onChange={set('status')} options={STATUS_OPTIONS} />
        <SelectFilter label="Organization" value={filters.organisation} onChange={set('organisation')} options={data.organizations.map((o) => ({ value: o.id, label: o.nom }))} />
        <Button onClick={() => setCreating(true)} className="sm:ml-auto"><UserPlus className="h-4 w-4" /> Add user</Button>
      </FilterBar>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
        {filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" message="Change the filters or add a user." />
        ) : (
          <>
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-soft">
                  {head('Name', 'name', 'px-5 py-3')}
                  {head('Organization', 'organisation_id', 'px-3 py-3')}
                  {head('Role', 'role', 'px-3 py-3')}
                  {head('Status', 'statut', 'px-3 py-3')}
                  {head('Joined', 'created', 'px-5 py-3')}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const self = u.id === me?.id
                  return (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper">
                      <td className="px-5 py-3">
                        <Link to={`/users/${u.id}`} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[11px] text-accent">{initials(`${u.prenom} ${u.nom}`)}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-ink hover:text-accent">{u.prenom} {u.nom}{self && <span className="ml-1.5 text-xs text-ink-soft">(you)</span>}</span>
                            <span className="block truncate text-xs text-ink-soft">{u.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{orgName(u.organisation_id)}</td>
                      <td className="px-3 py-3">
                        {u.role === 'super_admin' || self ? (
                          <span className="text-ink-soft" title={self ? 'You cannot change your own role' : undefined}>{roleLabel(u.role)}</span>
                        ) : (
                          <select value={u.role} aria-label={`Role of ${u.prenom} ${u.nom}`} onChange={(e) => setPending({ user: u, field: 'role', value: e.target.value })}
                            className="border border-line py-1 pl-2 pr-7 text-sm text-ink outline-none focus:border-accent cursor-pointer">
                            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {self ? <StatusBadge status="active" /> : (
                          <button type="button" onClick={() => setPending({ user: u, field: 'statut', value: u.statut === 'actif' ? 'inactif' : 'actif' })}
                            className="cursor-pointer" title={u.statut === 'actif' ? 'Deactivate' : 'Activate'}>
                            <StatusBadge status={u.statut === 'actif' ? 'active' : 'suspended'} label={u.statut === 'actif' ? 'Active' : 'Inactive'} />
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-soft">{u.creation_date ? new Date(u.creation_date).toLocaleDateString('en-GB') : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Pagination {...pagination} />
          </>
        )}
      </div>

      <CreateUserModal open={creating} onClose={() => setCreating(false)} organizations={data.organizations} onCreated={() => setReloadKey((k) => k + 1)} />
      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.value === 'inactif' ? 'danger' : 'warning'}
        title={pending?.field === 'role' ? 'Change role?' : pending?.value === 'inactif' ? 'Deactivate account?' : 'Activate account?'}
        message={pending ? (pending.field === 'role'
          ? `${pending.user.prenom} ${pending.user.nom} will become ${roleLabel(pending.value)}. Their access changes immediately.`
          : pending.value === 'inactif' ? `${pending.user.prenom} ${pending.user.nom} will no longer be able to sign in.` : `${pending.user.prenom} ${pending.user.nom} will be able to sign in again.`) : ''}
        confirmLabel={pending?.field === 'role' ? 'Change role' : pending?.value === 'inactif' ? 'Deactivate' : 'Activate'}
        onConfirm={applyChange}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

const TABS = [
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'registrations', label: 'Registrations', icon: Inbox },
  { id: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
]

function UsersPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'users'
  const pendingCount = pendingRegistrations().length

  return (
    <DashboardShell>
      <PageHeader eyebrow="User management" title="Users" subtitle="Manage accounts, approve new registrations and review what each role can do." />
      <Tabs active={tab} onChange={(id) => setParams(id === 'users' ? {} : { tab: id })}
        tabs={TABS.map((t) => (t.id === 'registrations' ? { ...t, count: pendingCount } : t))} />
      {tab === 'users' && <UsersTab />}
      {tab === 'registrations' && <RegistrationsPanel />}
      {tab === 'roles' && <RolesPanel />}
    </DashboardShell>
  )
}

export default UsersPage
