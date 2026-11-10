import { getCurrentUser, getFullName } from '../../../utils/roles'

const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

const daysFromNow = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

export const TOTAL_CONTROLS = 93

export const CONTROL_DOMAINS = ['Organizational controls', 'People controls', 'Physical controls', 'Technological controls']

const DOMAIN_SCORES = [71, 81, 88, 59]

export async function getSuperAdminDashboard() {
  await wait()
  return {
    kpis: {
      organisations: { total: 14, active: 12 },
      users: { total: 312, newThisMonth: 18 },
      pendingRegistrations: 7,
      averageCompliance: { value: 66, change: 3 },
      aiSystems: 87,
      storage: { usedGb: 182, limitGb: 500 },
    },
    complianceByOrganisation: [
      { name: 'Acme Bank', score: 82 },
      { name: 'Northwind Health', score: 74 },
      { name: 'Globex Insurance', score: 69 },
      { name: 'Initech', score: 63 },
      { name: 'Umbrella Pharma', score: 58 },
      { name: 'Stark Retail', score: 51 },
      { name: 'Wayne Logistics', score: 44 },
      { name: 'Hooli Cloud', score: 37 },
    ],
    roleDistribution: [
      { name: 'Super admin', value: 3 },
      { name: 'Admin', value: 24 },
      { name: 'Compliance officer', value: 198 },
      { name: 'Auditor', value: 87 },
    ],
    pendingRegistrations: [
      { id: 'r1', name: 'Priya Sharma', email: 'priya.sharma@acmebank.com', organisation: 'Acme Bank', jobTitle: 'Risk analyst', submittedAt: daysFromNow(0, -3) },
      { id: 'r2', name: 'Daniel Okafor', email: 'd.okafor@northwind.health', organisation: 'Northwind Health', jobTitle: 'Data protection officer', submittedAt: daysFromNow(-1) },
      { id: 'r3', name: 'Mei Lin', email: 'mei.lin@globex.com', organisation: 'Globex Insurance', jobTitle: 'ML engineer', submittedAt: daysFromNow(-1, -5) },
      { id: 'r4', name: 'Arjun Mehta', email: 'arjun@initech.io', organisation: 'Initech', jobTitle: 'Compliance lead', submittedAt: daysFromNow(-2) },
      { id: 'r5', name: 'Sofia Rossi', email: 'sofia.rossi@umbrella.com', organisation: 'Umbrella Pharma', jobTitle: 'Internal auditor', submittedAt: daysFromNow(-3) },
    ],
    organisations: [
      { id: 'o1', name: 'Acme Bank', sector: 'Banking', users: 64, aiSystems: 18, compliance: 82, status: 'active', lastActivity: daysFromNow(0, -1) },
      { id: 'o2', name: 'Northwind Health', sector: 'Healthcare', users: 41, aiSystems: 11, compliance: 74, status: 'active', lastActivity: daysFromNow(0, -4) },
      { id: 'o3', name: 'Globex Insurance', sector: 'Insurance', users: 38, aiSystems: 9, compliance: 69, status: 'active', lastActivity: daysFromNow(-1) },
      { id: 'o4', name: 'Initech', sector: 'Technology', users: 27, aiSystems: 14, compliance: 63, status: 'trial', lastActivity: daysFromNow(-2) },
      { id: 'o5', name: 'Umbrella Pharma', sector: 'Pharmaceuticals', users: 33, aiSystems: 7, compliance: 58, status: 'active', lastActivity: daysFromNow(-3) },
      { id: 'o6', name: 'Hooli Cloud', sector: 'Technology', users: 12, aiSystems: 6, compliance: 37, status: 'suspended', lastActivity: daysFromNow(-21) },
    ],
    activity: [
      { id: 'a1', actor: 'Ravi Kumar', action: 'created organisation', target: 'Stark Retail', type: 'organisation', at: daysFromNow(0, -1) },
      { id: 'a2', actor: 'System', action: 'flagged 3 failed sign-in attempts for', target: 'j.doe@initech.io', type: 'security', at: daysFromNow(0, -2) },
      { id: 'a3', actor: 'Anita Desai', action: 'approved registration of', target: 'Lucas Martin', type: 'user', at: daysFromNow(0, -5) },
      { id: 'a4', actor: 'Ravi Kumar', action: 'changed role of', target: 'Emma Wilson to Admin', type: 'user', at: daysFromNow(-1) },
      { id: 'a5', actor: 'System', action: 'storage reached 80% for', target: 'Acme Bank', type: 'system', at: daysFromNow(-1, -3) },
      { id: 'a6', actor: 'Anita Desai', action: 'suspended organisation', target: 'Hooli Cloud', type: 'organisation', at: daysFromNow(-2) },
    ],
  }
}

export async function getAdminDashboard() {
  await wait()
  return {
    organisation: 'Acme Bank',
    kpis: {
      complianceScore: { value: 72, change: 5 },
      controls: { implemented: 61, total: TOTAL_CONTROLS },
      tasks: { open: 24, overdue: 5 },
      pendingApprovals: 6,
      users: { active: 18, total: 21 },
    },
    controlStatus: [
      { name: 'Implemented', value: 61 },
      { name: 'In progress', value: 18 },
      { name: 'Not started', value: 9 },
      { name: 'Overdue', value: 5 },
    ],
    domainCompliance: CONTROL_DOMAINS.map((name, i) => ({ code: `A.${i + 5}`, name, score: DOMAIN_SCORES[i] })),
    tasksByStatus: [
      { status: 'not_started', count: 6 },
      { status: 'in_progress', count: 11 },
      { status: 'pending', count: 2 },
      { status: 'overdue', count: 5 },
      { status: 'completed', count: 38 },
    ],
    approvals: [
      { id: 'p1', type: 'Evidence', title: 'Penetration test report – retest annex', requestedBy: 'Priya Sharma', submittedAt: daysFromNow(0, -2), priority: 'high' },
      { id: 'p2', type: 'Policy', title: 'Acceptable use policy v2.1', requestedBy: getFullName(getCurrentUser()) || 'Karan Singh', submittedAt: daysFromNow(-1), priority: 'medium' },
      { id: 'p3', type: 'Registration', title: 'New user: Daniel Okafor (Risk team)', requestedBy: 'Self-registration', submittedAt: daysFromNow(-1, -6), priority: 'low' },
      { id: 'p4', type: 'Risk acceptance', title: 'Residual risk – legacy VPN without MFA', requestedBy: 'Emma Wilson', submittedAt: daysFromNow(-2), priority: 'high' },
      { id: 'p5', type: 'Evidence', title: 'Vendor due-diligence questionnaire – OpenAI', requestedBy: 'Rahul Verma', submittedAt: daysFromNow(-3), priority: 'medium' },
    ],
    deadlines: [
      { id: 'd1', title: 'Fix critical penetration test findings', owner: 'Priya Sharma', dueDate: daysFromNow(-2), status: 'overdue', type: 'Task' },
      { id: 'd2', title: 'Control A.8.5 – Secure authentication', owner: 'Priya Sharma', dueDate: daysFromNow(1), status: 'in_progress', type: 'Control' },
      { id: 'd3', title: 'Upload incident response playbook', owner: 'Emma Wilson', dueDate: daysFromNow(3), status: 'not_started', type: 'Evidence' },
      { id: 'd4', title: 'Q4 security steering committee review', owner: 'Anita Desai', dueDate: daysFromNow(6), status: 'pending', type: 'Milestone' },
      { id: 'd5', title: 'Supplier risk reassessment', owner: 'Rahul Verma', dueDate: daysFromNow(9), status: 'in_progress', type: 'Task' },
    ],
    team: [
      { id: 'u1', name: 'Priya Sharma', role: 'Compliance officer', assignedControls: 14, openTasks: 6, overdue: 2 },
      { id: 'u2', name: 'Karan Singh', role: 'Compliance officer', assignedControls: 12, openTasks: 5, overdue: 1 },
      { id: 'u3', name: 'Emma Wilson', role: 'Risk manager', assignedControls: 11, openTasks: 4, overdue: 1 },
      { id: 'u4', name: 'Rahul Verma', role: 'Compliance officer', assignedControls: 9, openTasks: 5, overdue: 1 },
      { id: 'u5', name: 'Meera Iyer', role: 'Auditor', assignedControls: 6, openTasks: 2, overdue: 0 },
    ],
    activity: [
      { id: 'a1', actor: 'Priya Sharma', action: 'uploaded evidence for', target: 'Control A.8.13', type: 'evidence', at: daysFromNow(0, -1) },
      { id: 'a2', actor: 'Karan Singh', action: 'marked as implemented', target: 'Control A.5.1', type: 'control', at: daysFromNow(0, -3) },
      { id: 'a3', actor: 'Emma Wilson', action: 'raised a new risk on', target: 'Customer portal', type: 'risk', at: daysFromNow(0, -6) },
      { id: 'a4', actor: 'Anita Desai', action: 'approved policy', target: 'Incident response procedure v1.4', type: 'approval', at: daysFromNow(-1) },
      { id: 'a5', actor: 'Meera Iyer', action: 'completed assessment of', target: 'Physical controls (A.7)', type: 'control', at: daysFromNow(-2) },
    ],
  }
}

export async function getUserDashboard() {
  await wait()
  return {
    kpis: {
      assignedControls: { total: 8, implemented: 5 },
      evidenceRequests: 3,
      dueThisWeek: 4,
      overdue: 1,
    },
    progress: 63,
    tasks: [
      { id: 't1', title: 'Classify the assets you own in the asset register', control: 'A.5.12', priority: 'high', status: 'overdue', dueDate: daysFromNow(-1) },
      { id: 't2', title: 'Complete the quarterly user access review', control: 'A.5.18', priority: 'high', status: 'in_progress', dueDate: daysFromNow(1) },
      { id: 't3', title: 'Review firewall rules with the network team', control: 'A.8.20', priority: 'medium', status: 'not_started', dueDate: daysFromNow(3) },
      { id: 't4', title: 'Update the backup restore procedure', control: 'A.8.13', priority: 'medium', status: 'in_progress', dueDate: daysFromNow(5) },
      { id: 't5', title: 'Complete the annual security awareness course', control: 'A.6.3', priority: 'low', status: 'not_started', dueDate: daysFromNow(12) },
    ],
    evidenceRequests: [
      { id: 'e1', control: 'A.5.12', controlName: 'Classification of information', requestedBy: 'Anita Desai', dueDate: daysFromNow(2), note: 'Asset register export with classification column' },
      { id: 'e2', control: 'A.8.13', controlName: 'Information backup', requestedBy: 'Meera Iyer', dueDate: daysFromNow(4), note: 'Latest successful restore test log' },
      { id: 'e3', control: 'A.5.18', controlName: 'Access rights', requestedBy: 'Anita Desai', dueDate: daysFromNow(8), note: 'Signed quarterly access review (Q4)' },
    ],
    controls: [
      { id: 'c1', code: 'A.5.12', name: 'Classification of information', domain: 'Organizational controls', status: 'overdue', progress: 40 },
      { id: 'c2', code: 'A.5.18', name: 'Access rights', domain: 'Organizational controls', status: 'in_progress', progress: 55 },
      { id: 'c3', code: 'A.8.20', name: 'Networks security', domain: 'Technological controls', status: 'in_progress', progress: 70 },
      { id: 'c4', code: 'A.8.13', name: 'Information backup', domain: 'Technological controls', status: 'implemented', progress: 100 },
      { id: 'c5', code: 'A.6.3', name: 'Information security awareness, education, and training', domain: 'People controls', status: 'implemented', progress: 100 },
      { id: 'c6', code: 'A.8.15', name: 'Logging', domain: 'Technological controls', status: 'implemented', progress: 100 },
    ],
  }
}
