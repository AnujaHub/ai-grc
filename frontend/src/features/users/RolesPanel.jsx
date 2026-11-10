import { useState } from 'react'
import { Check, Lock, Minus } from 'lucide-react'
import { Alert, Button } from '../../components/ui'
import { ROLES, ROLE_LABELS, getCurrentUser } from '../../utils/roles'
import { toast } from '../../utils/toast'
import { MATRIX_ROLES, PERMISSION_GROUPS, ROLE_DESCRIPTIONS, savePermissions } from './usersData'

const initialGrants = () => Object.fromEntries(PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => [i.id, [...i.roles]])))

const READ_ONLY_FOR_AUDITOR = new Set(['controls.view', 'audit.view'])

function RolesPanel() {
  const canConfigure = getCurrentUser()?.role === ROLES.SUPER_ADMIN
  const [grants, setGrants] = useState(initialGrants)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(grants) !== JSON.stringify(initialGrants())

  const blocked = (item, role) => item.locked || role === ROLES.SUPER_ADMIN || (role === ROLES.AUDITOR && !READ_ONLY_FOR_AUDITOR.has(item.id))

  const toggle = (item, role) => {
    if (!canConfigure || blocked(item, role)) return
    setGrants((g) => {
      const roles = g[item.id].includes(role) ? g[item.id].filter((r) => r !== role) : [...g[item.id], role]
      return { ...g, [item.id]: roles }
    })
  }

  const save = async () => {
    setSaving(true)
    await savePermissions(grants)
    setSaving(false)
    toast('Permissions saved.')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MATRIX_ROLES.map((role) => (
          <div key={role} className="rounded-xl border border-line bg-paper-dark p-4">
            <p className="text-sm font-semibold text-ink">{ROLE_LABELS[role]}</p>
            <p className="mt-1 text-xs text-ink-soft">{ROLE_DESCRIPTIONS[role]}</p>
            <p className="mt-3 font-mono text-xs text-accent">{Object.values(grants).filter((r) => r.includes(role)).length} permissions</p>
          </div>
        ))}
      </div>

      {canConfigure ? (
        <Alert variant="info">Click a cell to grant or remove a permission. Locked cells protect segregation of duties: auditors stay read-only and the super admin keeps full access.</Alert>
      ) : (
        <Alert variant="info">Only the super admin can change permissions. This view shows what each role can do.</Alert>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-semibold">Permission</th>
              {MATRIX_ROLES.map((role) => <th key={role} className="w-36 px-3 py-3 text-center font-semibold">{ROLE_LABELS[role]}</th>)}
            </tr>
          </thead>
          {PERMISSION_GROUPS.map((group) => (
            <tbody key={group.group}>
              <tr><td colSpan={MATRIX_ROLES.length + 1} className="bg-paper px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{group.group}</td></tr>
              {group.items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5 text-ink">{item.label}</td>
                  {MATRIX_ROLES.map((role) => {
                    const on = grants[item.id].includes(role)
                    const locked = blocked(item, role)
                    return (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <button type="button" onClick={() => toggle(item, role)} disabled={!canConfigure || locked}
                          aria-label={`${item.label} for ${ROLE_LABELS[role]}: ${on ? 'allowed' : 'not allowed'}`} aria-pressed={on}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${on ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line text-ink-soft/50'} ${canConfigure && !locked ? 'cursor-pointer hover:border-accent' : 'cursor-default'}`}>
                          {on ? <Check className="h-4 w-4" /> : locked && canConfigure ? <Lock className="h-3 w-3" /> : <Minus className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {canConfigure && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setGrants(initialGrants())} disabled={!dirty}>Discard</Button>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save permissions</Button>
        </div>
      )}
    </div>
  )
}

export default RolesPanel
