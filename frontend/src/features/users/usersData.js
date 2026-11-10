import { ROLES, ROLE_LABELS } from '../../utils/roles'
import { allControls } from '../controls/controlsData'
import { listEvidence, listPolicies } from '../evidence/evidenceData'
import { getPlan } from '../grc-plan/planData'

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const daysFromNow = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

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

const registrations = [
  { id: 'REG-101', name: 'Daniel Okafor', email: 'd.okafor@acmebank.com', organisation: 'Acme Bank', jobTitle: 'Facilities manager', phone: '+44 20 7946 0101', submittedAt: daysFromNow(0, -3), emailVerified: true, status: 'pending' },
  { id: 'REG-102', name: 'Mei Lin', email: 'mei.lin@acmebank.com', organisation: 'Acme Bank', jobTitle: 'Security engineer', phone: '', submittedAt: daysFromNow(-1), emailVerified: true, status: 'pending' },
  { id: 'REG-103', name: 'Lucas Martin', email: 'lucas.martin@gmail.com', organisation: 'Acme Bank', jobTitle: 'Contractor', phone: '+33 6 12 34 56 78', submittedAt: daysFromNow(-2), emailVerified: false, status: 'pending' },
  { id: 'REG-097', name: 'Sofia Rossi', email: 'sofia.rossi@acmebank.com', organisation: 'Acme Bank', jobTitle: 'HR & training lead', phone: '', submittedAt: daysFromNow(-9), emailVerified: true, status: 'approved', decidedBy: 'Anita Desai', decidedAt: daysFromNow(-8), assignedRole: ROLES.COMPLIANCE_OFFICER },
  { id: 'REG-094', name: 'J. Doe', email: 'jdoe@tempmail.net', organisation: 'Unknown', jobTitle: '', phone: '', submittedAt: daysFromNow(-12), emailVerified: false, status: 'rejected', decidedBy: 'Anita Desai', decidedAt: daysFromNow(-11), reason: 'Personal email address and no matching employee record.' },
]

export async function listRegistrations() {
  await wait()
  return registrations.map((r) => ({ ...r }))
}

export async function decideRegistration(id, decision, { role, reason, actor }) {
  await wait(300)
  const item = registrations.find((r) => r.id === id)
  Object.assign(item, { status: decision, decidedBy: actor, decidedAt: new Date().toISOString(), assignedRole: role || null, reason: reason || null })
  return { ...item }
}

export const pendingRegistrations = () => registrations.filter((r) => r.status === 'pending').map((r) => ({ ...r }))

export const PERMISSION_GROUPS = [
  {
    group: 'Administration',
    items: [
      { id: 'users.manage', label: 'Create and edit users', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { id: 'registrations.decide', label: 'Approve or reject registrations', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
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
