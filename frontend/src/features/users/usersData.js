import { ROLES, ROLE_LABELS } from '../../utils/roles'
import { allControls } from '../controls/controlsData'
import { listEvidence, listPolicies } from '../evidence/evidenceData'
import { getPlan } from '../grc-plan/planData'

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.COMPLIANCE_OFFICER, label: ROLE_LABELS[ROLES.COMPLIANCE_OFFICER] },
  { value: ROLES.AUDITOR, label: ROLE_LABELS[ROLES.AUDITOR] },
  { value: 'manager', label: 'Manager' },
]

export const roleLabel = (role) => ROLE_LABELS[role] || ROLE_OPTIONS.find((r) => r.value === role)?.label || role

export const STATUS_OPTIONS = [
  { value: 'actif', label: 'Active' },
  { value: 'inactif', label: 'Inactive' },
]

export const PERMISSION_GROUPS = [
  {
    group: 'Administration',
    items: [
      { id: 'users.manage', label: 'Create and edit users', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { id: 'roles.configure', label: 'Configure roles and permissions', roles: [ROLES.SUPER_ADMIN], locked: true },
      { id: 'organizations.manage', label: 'Manage organizations', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    ],
  },
  {
    group: 'Controls & evidence',
    items: [
      { id: 'controls.view', label: 'View controls and evidence', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER, ROLES.AUDITOR] },
      { id: 'controls.update', label: 'Update control status and owner', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER] },
      { id: 'evidence.upload', label: 'Upload and link evidence', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER] },
      { id: 'evidence.review', label: 'Approve or reject evidence', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { id: 'documents.publish', label: 'Approve policy documents', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    ],
  },
  {
    group: 'Planning & approvals',
    items: [
      { id: 'tasks.create', label: 'Create and assign tasks', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { id: 'tasks.update', label: 'Update own tasks', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER] },
      { id: 'approvals.decide', label: 'Decide approval requests', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { id: 'ai.accept', label: 'Accept AI suggestions', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER] },
    ],
  },
  {
    group: 'Reports & audit',
    items: [
      { id: 'reports.generate', label: 'Generate reports', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER] },
      { id: 'audit.view', label: 'View and export the audit log', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AUDITOR] },
    ],
  },
]

export const MATRIX_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMPLIANCE_OFFICER, ROLES.AUDITOR]

export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'Runs the platform across all organizations.',
  [ROLES.ADMIN]: 'Manages one organization, its users and approvals.',
  [ROLES.COMPLIANCE_OFFICER]: 'Implements controls, uploads evidence and works on tasks.',
  [ROLES.AUDITOR]: 'Independent, read-only access to controls, evidence and the audit log.',
}

export async function savePermissions(grants) {
  await wait(400)
  PERMISSION_GROUPS.forEach((g) => g.items.forEach((item) => {
    if (!item.locked && grants[item.id]) item.roles = [...grants[item.id]]
  }))
  return true
}

export async function getResponsibilities(fullName) {
  const [plan, evidence, policies] = await Promise.all([getPlan(), listEvidence(), listPolicies()])
  return {
    controls: allControls().filter((c) => c.owner === fullName).map((c) => ({ ...c })),
    tasks: plan.tasks.filter((t) => t.owner === fullName),
    evidence: evidence.filter((e) => e.uploadedBy === fullName),
    documents: policies.filter((p) => p.owner === fullName),
  }
}
