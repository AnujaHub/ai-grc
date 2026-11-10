import { listEvidence, listPolicies, reviewEvidence, savePolicy } from '../evidence/evidenceData'
import { decideRegistration, listRegistrations } from '../users/usersData'

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const daysFromNow = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

export const APPROVAL_TYPES = ['Evidence', 'Policy', 'Registration', 'Risk acceptance', 'Access request', 'Exception']

const manual = [
  {
    id: 'APR-RA-12', type: 'Risk acceptance', title: 'Accept residual risk: legacy VPN without MFA', requestedBy: 'Emma Wilson', submittedAt: daysFromNow(-2), priority: 'high', status: 'pending',
    description: 'The legacy VPN used by two vendors cannot enforce MFA until the Q1 migration. Compensating controls: IP allow-listing and session recording.',
    details: [['Risk', 'Unauthorised remote access'], ['Residual rating', 'Medium'], ['Control', 'A.8.5 Secure authentication'], ['Expires', '31 Mar']],
    link: '/controls/A.8.5',
  },
  {
    id: 'APR-AR-31', type: 'Access request', title: 'Privileged access to the production database for Arjun Mehta', requestedBy: 'Arjun Mehta', submittedAt: daysFromNow(0, -5), priority: 'medium', status: 'pending',
    description: 'Temporary admin access for 48 hours to complete the backup restore test.',
    details: [['System', 'Production PostgreSQL'], ['Access', 'Admin'], ['Duration', '48 hours'], ['Control', 'A.8.2 Privileged access rights']],
    link: '/controls/A.8.2',
  },
  {
    id: 'APR-EX-07', type: 'Exception', title: 'Policy exception: unencrypted USB for the auditor', requestedBy: 'Karan Singh', submittedAt: daysFromNow(-4), priority: 'low', status: 'rejected',
    description: 'One-off exception to hand over audit files on an unencrypted USB drive.',
    details: [['Policy', 'Acceptable use policy'], ['Control', 'A.7.10 Storage media']],
    link: '/controls/A.7.10', decidedBy: 'Anita Desai', decidedAt: daysFromNow(-3), comment: 'Use the secure file transfer portal instead.',
  },
  {
    id: 'APR-RA-09', type: 'Risk acceptance', title: 'Accept risk: delayed patching on the HR kiosk', requestedBy: 'Sofia Rossi', submittedAt: daysFromNow(-10), priority: 'medium', status: 'approved',
    description: 'The kiosk vendor certifies patches quarterly. The kiosk is isolated on its own network segment.',
    details: [['Control', 'A.8.8 Management of technical vulnerabilities'], ['Expires', '30 Jun']],
    link: '/controls/A.8.8', decidedBy: 'Anita Desai', decidedAt: daysFromNow(-9), comment: 'Approved until the vendor contract renewal.',
  },
]

const comments = {}
const history = {}

const priorityFor = (confidentiality) => (confidentiality === 'Restricted' ? 'high' : confidentiality === 'Confidential' ? 'medium' : 'low')

async function collect() {
  const [evidence, policies, registrations] = await Promise.all([listEvidence(), listPolicies(), listRegistrations()])
  const fromEvidence = evidence
    .filter((e) => ['in_review', 'approved', 'rejected'].includes(e.status) && (e.status === 'in_review' || e.reviewer))
    .slice(0, 8)
    .map((e) => ({
      id: `APR-${e.id}`, sourceId: e.id, type: 'Evidence', title: e.title, requestedBy: e.versions[0].uploadedBy, submittedAt: e.versions[0].uploadedAt,
      priority: priorityFor(e.confidentiality), status: e.status === 'in_review' ? 'pending' : e.status,
      description: e.description, details: [['File', e.fileName], ['Version', `v${e.versions[0].version}`], ['Controls', e.controls.join(', ')], ['Confidentiality', e.confidentiality]],
      link: `/evidence/${e.id}`, decidedBy: e.status === 'in_review' ? null : e.reviewer, decidedAt: e.status === 'in_review' ? null : e.uploadedAt, comment: e.reviewComment || null,
    }))
  const fromPolicies = policies
    .filter((p) => p.status === 'in_review')
    .map((p) => ({
      id: `APR-${p.id}`, sourceId: p.id, type: 'Policy', title: `${p.title} v${p.version}`, requestedBy: p.owner, submittedAt: p.updatedAt, priority: 'medium', status: 'pending',
      description: `New version of the ${p.title.toLowerCase()} submitted for approval.`, details: [['Version', p.version], ['Controls', p.controls.join(', ') || '—']],
      link: `/evidence/documents/${p.id}`,
    }))
  const fromRegistrations = registrations.map((r) => ({
    id: `APR-${r.id}`, sourceId: r.id, type: 'Registration', title: `New user: ${r.name}`, requestedBy: 'Self-registration', submittedAt: r.submittedAt, priority: 'low',
    status: r.status, description: `${r.name} (${r.jobTitle || 'no job title'}) asked to join ${r.organisation}.`,
    details: [['Email', r.email], ['Email verified', r.emailVerified ? 'Yes' : 'No'], ['Organization', r.organisation]],
    link: '/users?tab=registrations', decidedBy: r.decidedBy || null, decidedAt: r.decidedAt || null, comment: r.reason || null,
  }))
  return [...fromEvidence, ...fromPolicies, ...fromRegistrations, ...manual.map((m) => ({ ...m }))]
    .map((a) => ({
      ...a,
      comments: comments[a.id] || [],
      history: [
        { at: a.submittedAt, actor: a.requestedBy, action: 'Submitted for approval' },
        ...(history[a.id] || []),
        ...(a.decidedAt && !(history[a.id] || []).length ? [{ at: a.decidedAt, actor: a.decidedBy, action: a.status === 'approved' ? 'Approved' : 'Rejected' }] : []),
      ],
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export async function listApprovals() {
  await wait()
  return collect()
}

export async function getApproval(id) {
  await wait()
  const item = (await collect()).find((a) => a.id === id)
  if (!item) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Approval request not found.' } }
    throw error
  }
  return item
}

export async function decideApproval(item, decision, comment, actor) {
  if (item.type === 'Evidence') await reviewEvidence(item.sourceId, decision, comment, actor)
  else if (item.type === 'Policy') await savePolicy(item.sourceId, { status: decision === 'approved' ? 'approved' : 'draft' })
  else if (item.type === 'Registration') await decideRegistration(item.sourceId, decision, { role: 'responsable_conformite', reason: comment, actor })
  else Object.assign(manual.find((m) => m.id === item.id), { status: decision, decidedBy: actor, decidedAt: new Date().toISOString(), comment })
  history[item.id] = [...(history[item.id] || []), { at: new Date().toISOString(), actor, action: `${decision === 'approved' ? 'Approved' : 'Rejected'}${comment ? `: ${comment}` : ''}` }]
  return getApproval(item.id)
}

export async function addApprovalComment(id, text, author) {
  await wait(200)
  comments[id] = [...(comments[id] || []), { id: `${id}-${Date.now()}`, author, text, at: new Date().toISOString() }]
  return getApproval(id)
}
