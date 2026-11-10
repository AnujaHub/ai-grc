import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ListChecks, ListTodo, FileText, ScrollText, History } from 'lucide-react'
import { getUtilisateurs, modifierUtilisateur } from '../../services/userService'
import { getOrganisations } from '../../services/organizationService'
import { getJournalAudit } from '../../services/auditLogService'
import { getCurrentUser } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import DashboardShell from '../dashboard/components/DashboardShell'
import DashboardSkeleton from '../dashboard/components/DashboardSkeleton'
import SectionCard from '../dashboard/components/SectionCard'
import { dueLabel, dueTone, initials, timeAgo } from '../dashboard/utils/format'
import { displayStatus } from '../grc-plan/planData'
import { ROLE_OPTIONS, getResponsibilities, roleLabel } from './usersData'

function Info({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  )
}

const LIST_TABS = [
  { id: 'controls', label: 'Controls owned', icon: ListChecks },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'evidence', label: 'Evidence uploaded', icon: FileText },
  { id: 'documents', label: 'Documents owned', icon: ScrollText },
]

function ResponsibilityList({ tab, items }) {
  if (!items.length) return <EmptyState title="Nothing assigned" message="This person has no items of this type." />
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const row = {
          controls: { key: item.code, to: `/controls/${item.code}`, ref: item.code, title: item.title, status: item.status, meta: item.status === 'implemented' ? item.domain : dueLabel(item.dueDate), tone: item.status === 'implemented' ? '' : dueTone(item.dueDate) },
          tasks: { key: item.id, to: `/grc-plan/tasks/${item.id}`, ref: item.id, title: item.title, status: displayStatus(item), meta: item.status === 'completed' ? 'Completed' : dueLabel(item.dueDate), tone: item.status === 'completed' ? '' : dueTone(item.dueDate) },
          evidence: { key: item.id, to: `/evidence/${item.id}`, ref: item.id, title: item.title, status: item.status, meta: `Uploaded ${timeAgo(item.uploadedAt)}` },
          documents: { key: item.id, to: `/evidence/documents/${item.id}`, ref: item.id, title: item.title, status: item.status, meta: `v${item.version}` },
        }[tab]
        return (
          <li key={row.key}>
            <Link to={row.to} className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
              <span className="w-16 shrink-0 font-mono text-xs text-accent">{row.ref}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{row.title}</span>
                <span className={`text-xs ${row.tone || 'text-ink-soft'}`}>{row.meta}</span>
              </span>
              <StatusBadge status={row.status} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function UserDetailPage() {
  const id = Number(useParams().id)
  const me = getCurrentUser()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('controls')
  const [pending, setPending] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getUtilisateurs(), getOrganisations(), getJournalAudit().catch(() => [])])
      .then(async ([users, organizations, audit]) => {
        const user = users.find((u) => u.id === id)
        if (!user) throw new Error('missing')
        const fullName = `${user.prenom} ${user.nom}`
        const responsibilities = await getResponsibilities(fullName)
        const activity = audit.filter((e) => e.utilisateur_email === user.email).slice(0, 10)
        if (active) setData({ user, organization: organizations.find((o) => o.id === user.organisation_id), responsibilities, activity })
      })
      .catch(() => active && setError('User not found, or the backend is not reachable.'))
    return () => {
      active = false
    }
  }, [id, reloadKey])

  const apply = async () => {
    try {
      await modifierUtilisateur(id, { [pending.field]: pending.value })
      toast(pending.field === 'role' ? `Role changed to ${roleLabel(pending.value)}.` : pending.value === 'actif' ? 'Account activated.' : 'Account deactivated.')
      setReloadKey((k) => k + 1)
    } catch {
      toast('Update failed.', 'error')
    } finally {
      setPending(null)
    }
  }

  if (error || !data) {
    return (
      <DashboardShell>
        <PageHeader back={{ to: '/users', label: 'Users' }} title="User" />
        {error ? <Alert variant="error">{error}</Alert> : <DashboardSkeleton />}
      </DashboardShell>
    )
  }

  const { user, organization, responsibilities, activity } = data
  const self = user.id === me?.id
  const editable = !self && user.role !== 'super_admin'
  const active = user.statut === 'actif'

  return (
    <DashboardShell>
      <PageHeader
        back={{ to: '/users', label: 'Users' }}
        crumb={`${user.prenom} ${user.nom}`}
        eyebrow={user.email}
        title={`${user.prenom} ${user.nom}`}
        badge={<StatusBadge status={active ? 'active' : 'suspended'} label={active ? 'Active' : 'Inactive'} />}
        actions={editable && (
          <Button variant="secondary" onClick={() => setPending({ field: 'statut', value: active ? 'inactif' : 'actif' })}>
            {active ? 'Deactivate account' : 'Activate account'}
          </Button>
        )}
      />
      {self && <Alert variant="info">This is your own account. Another administrator must change your role or status.</Alert>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <SectionCard title="Details">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft font-mono text-sm text-accent">{initials(`${user.prenom} ${user.nom}`)}</span>
              <div>
                <p className="text-sm font-medium text-ink">{user.prenom} {user.nom}</p>
                <p className="text-xs text-ink-soft">{roleLabel(user.role)}</p>
              </div>
            </div>
            <dl className="divide-y divide-line">
              <Info label="Role">
                {editable ? (
                  <select value={user.role} aria-label="Role" onChange={(e) => setPending({ field: 'role', value: e.target.value })}
                    className="max-w-[11rem] border border-line py-1 pl-2 pr-7 text-sm text-ink outline-none focus:border-accent cursor-pointer">
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                ) : roleLabel(user.role)}
              </Info>
              <Info label="Organization">{organization?.nom || '—'}</Info>
              <Info label="Joined">{user.creation_date ? new Date(user.creation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</Info>
              <Info label="Controls owned">{responsibilities.controls.length}</Info>
              <Info label="Open tasks">{responsibilities.tasks.filter((t) => t.status !== 'completed').length}</Info>
            </dl>
          </SectionCard>

          <SectionCard title="Recent activity" action={{ label: 'Audit log', to: '/audit-log' }} bodyClassName="p-0">
            {activity.length === 0 ? <EmptyState icon={History} title="No recorded activity" /> : (
              <ul className="divide-y divide-line">
                {activity.map((e) => (
                  <li key={e.id} className="px-5 py-2.5 text-sm">
                    <p className="text-ink">{e.action} · <span className="text-ink-soft">{e.ressource_type}</span></p>
                    <p className="text-xs text-ink-soft">{timeAgo(e.action_date)}{e.details ? ` · ${e.details}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="rounded-xl border border-line bg-paper-dark lg:col-span-2">
          <div className="px-5 pt-2">
            <Tabs active={tab} onChange={setTab} tabs={LIST_TABS.map((t) => ({ ...t, count: responsibilities[t.id].length }))} />
          </div>
          <ResponsibilityList tab={tab} items={responsibilities[tab]} />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.value === 'inactif' ? 'danger' : 'warning'}
        title={pending?.field === 'role' ? 'Change role?' : active ? 'Deactivate account?' : 'Activate account?'}
        message={pending?.field === 'role' ? `${user.prenom} will become ${roleLabel(pending.value)}. Their access changes immediately.` : active ? `${user.prenom} will no longer be able to sign in.` : `${user.prenom} will be able to sign in again.`}
        confirmLabel={pending?.field === 'role' ? 'Change role' : active ? 'Deactivate' : 'Activate'}
        onConfirm={apply}
        onCancel={() => setPending(null)}
      />
    </DashboardShell>
  )
}

export default UserDetailPage
