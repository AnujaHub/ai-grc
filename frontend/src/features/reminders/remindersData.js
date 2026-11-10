import { REMINDER_DAYS, daysUntil } from '../dashboard/utils/format'
import { listControls } from '../controls/controlsData'
import { listEvidence, listPolicies } from '../evidence/evidenceData'
import { getPlan } from '../grc-plan/planData'

const within = (iso) => iso && daysUntil(iso) <= REMINDER_DAYS

const level = (iso) => {
  const days = daysUntil(iso)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  return 'soon'
}

export async function getReminders() {
  const [controls, plan, evidence, policies] = await Promise.all([listControls(), getPlan(), listEvidence(), listPolicies()])

  const items = [
    ...plan.tasks
      .filter((t) => t.status !== 'completed' && within(t.dueDate))
      .map((t) => ({ id: `task-${t.id}`, kind: 'Task', title: t.title, ref: t.id, owner: t.owner, dueDate: t.dueDate, to: `/grc-plan/tasks/${t.id}` })),
    ...controls
      .filter((c) => !['implemented', 'not_applicable'].includes(c.status) && within(c.dueDate))
      .map((c) => ({ id: `control-${c.code}`, kind: 'Control', title: c.title, ref: c.code, owner: c.owner, dueDate: c.dueDate, to: `/controls/${c.code}` })),
    ...evidence
      .filter((e) => e.validUntil && within(e.validUntil))
      .map((e) => ({ id: `evidence-${e.id}`, kind: 'Evidence expiry', title: e.title, ref: e.id, owner: e.uploadedBy, dueDate: e.validUntil, to: `/evidence/${e.id}` })),
    ...policies
      .filter((p) => p.nextReview && within(p.nextReview))
      .map((p) => ({ id: `policy-${p.id}`, kind: 'Policy review', title: p.title, ref: p.id, owner: p.owner, dueDate: p.nextReview, to: `/evidence/documents/${p.id}` })),
    ...plan.milestones
      .filter((m) => !m.completedAt && within(m.dueDate))
      .map((m) => ({ id: `milestone-${m.id}`, kind: 'Milestone', title: m.title, ref: m.id, owner: m.owner, dueDate: m.dueDate, to: '/grc-plan?tab=milestones' })),
  ]

  return items
    .map((item) => ({ ...item, level: level(item.dueDate) }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}
