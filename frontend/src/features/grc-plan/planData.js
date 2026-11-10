const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

const daysFromNow = (days) => {
  const d = new Date()
  d.setHours(9, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const TASK_STATUSES = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'in_review', label: 'In review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

export const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const plan = {
  name: 'ISO/IEC 27001:2022 certification programme',
  owner: 'Anita Desai',
  startDate: daysFromNow(-120),
  endDate: daysFromNow(140),
  health: 'at_risk',
  healthReason: 'Two high-priority tasks are overdue and the high-risk controls milestone depends on them.',
  budget: { spent: 184000, total: 320000, currency: 'USD' },
}

const milestones = [
  { id: 'M1', title: 'Risk assessment and Statement of Applicability', owner: 'Karan Singh', dueDate: daysFromNow(-90), completedAt: daysFromNow(-93), description: 'Information security risk assessment completed and all 93 Annex A controls assessed in the Statement of Applicability.' },
  { id: 'M2', title: 'ISMS policy suite approved', owner: 'Anita Desai', dueDate: daysFromNow(-30), completedAt: daysFromNow(-26), description: 'Information security, acceptable use, access control and supplier policies approved by management.' },
  { id: 'M3', title: 'High-risk controls implemented', owner: 'Priya Sharma', dueDate: daysFromNow(21), completedAt: null, description: 'All controls rated high risk are implemented with approved evidence.' },
  { id: 'M4', title: 'Internal audit', owner: 'Meera Iyer', dueDate: daysFromNow(55), completedAt: null, description: 'Independent internal audit of the information security management system.' },
  { id: 'M5', title: 'Management review', owner: 'Anita Desai', dueDate: daysFromNow(85), completedAt: null, description: 'Management review of audit results, risks, objectives and improvement actions.' },
  { id: 'M6', title: 'Certification audit', owner: 'Anita Desai', dueDate: daysFromNow(130), completedAt: null, description: 'Stage 1 and stage 2 audits by the certification body.' },
]

const tasks = [
  { id: 'T-101', title: 'Fix critical findings from the penetration test', control: 'A.8.8', milestoneId: 'M3', owner: 'Priya Sharma', priority: 'high', status: 'in_progress', startDate: daysFromNow(-20), dueDate: daysFromNow(-2), progress: 70 },
  { id: 'T-102', title: 'Document network architecture and segmentation', control: 'A.8.20', milestoneId: 'M3', owner: 'Arjun Mehta', priority: 'high', status: 'in_review', startDate: daysFromNow(-14), dueDate: daysFromNow(3), progress: 90 },
  { id: 'T-103', title: 'Classify all assets in the asset register', control: 'A.5.12', milestoneId: 'M3', owner: 'Karan Singh', priority: 'high', status: 'in_progress', startDate: daysFromNow(-10), dueDate: daysFromNow(1), progress: 55 },
  { id: 'T-104', title: 'Enforce MFA for all privileged accounts', control: 'A.8.5', milestoneId: 'M3', owner: 'Priya Sharma', priority: 'high', status: 'blocked', startDate: daysFromNow(-8), dueDate: daysFromNow(-1), progress: 30, blockedReason: 'Waiting for procurement to approve the MFA licences.' },
  { id: 'T-105', title: 'Define log retention and review process', control: 'A.8.15', milestoneId: 'M3', owner: 'Priya Sharma', priority: 'medium', status: 'not_started', startDate: daysFromNow(2), dueDate: daysFromNow(14), progress: 0 },
  { id: 'T-106', title: 'Set up security monitoring alerts', control: 'A.8.16', milestoneId: 'M3', owner: 'Arjun Mehta', priority: 'medium', status: 'in_progress', startDate: daysFromNow(-5), dueDate: daysFromNow(9), progress: 40 },
  { id: 'T-107', title: 'Reassess cloud provider security', control: 'A.5.23', milestoneId: 'M3', owner: 'Rahul Verma', priority: 'medium', status: 'in_progress', startDate: daysFromNow(-3), dueDate: daysFromNow(12), progress: 25 },
  { id: 'T-108', title: 'Run the Q4 security awareness campaign', control: 'A.6.3', milestoneId: 'M4', owner: 'Sofia Rossi', priority: 'low', status: 'in_progress', startDate: daysFromNow(-12), dueDate: daysFromNow(20), progress: 60 },
  { id: 'T-109', title: 'Prepare internal audit plan and scope', control: 'A.5.35', milestoneId: 'M4', owner: 'Karan Singh', priority: 'medium', status: 'not_started', startDate: daysFromNow(10), dueDate: daysFromNow(30), progress: 0 },
  { id: 'T-110', title: 'Run a business continuity tabletop exercise', control: 'A.5.30', milestoneId: 'M4', owner: 'Emma Wilson', priority: 'medium', status: 'not_started', startDate: daysFromNow(15), dueDate: daysFromNow(40), progress: 0 },
  { id: 'T-111', title: 'Compile ISMS metrics for management review', control: 'A.5.36', milestoneId: 'M5', owner: 'Karan Singh', priority: 'low', status: 'not_started', startDate: daysFromNow(60), dueDate: daysFromNow(78), progress: 0 },
  { id: 'T-112', title: 'Approve information security policy v3', control: 'A.5.1', milestoneId: 'M2', owner: 'Anita Desai', priority: 'high', status: 'completed', startDate: daysFromNow(-50), dueDate: daysFromNow(-30), progress: 100 },
  { id: 'T-113', title: 'Publish the information asset register', control: 'A.5.9', milestoneId: 'M2', owner: 'Arjun Mehta', priority: 'high', status: 'completed', startDate: daysFromNow(-60), dueDate: daysFromNow(-35), progress: 100 },
  { id: 'T-114', title: 'Assess all Annex A controls for the Statement of Applicability', control: 'A.5.36', milestoneId: 'M1', owner: 'Karan Singh', priority: 'high', status: 'completed', startDate: daysFromNow(-120), dueDate: daysFromNow(-92), progress: 100 },
].map((task) => ({
  ...task,
  description: `Deliver the work required for control ${task.control} and upload supporting evidence for review.`,
  checklist: [
    { id: 'c1', label: 'Agree scope with control owner', done: task.progress > 0 },
    { id: 'c2', label: 'Perform the work and record results', done: task.progress >= 50 },
    { id: 'c3', label: 'Upload evidence to the library', done: task.progress >= 90 },
    { id: 'c4', label: 'Reviewer sign-off', done: task.progress === 100 },
  ],
  comments: task.status === 'blocked'
    ? [{ id: 'm1', author: 'Priya Sharma', at: daysFromNow(-1), text: 'Licence request is still with procurement. Escalated to the CISO.' }]
    : task.progress > 0
      ? [{ id: 'm1', author: task.owner, at: daysFromNow(-2), text: 'Work started, first results shared with the control owner.' }]
      : [],
}))

const events = [
  { id: 'E1', title: 'Security steering committee', date: daysFromNow(4), type: 'meeting' },
  { id: 'E2', title: 'Evidence review session', date: daysFromNow(7), type: 'review' },
  { id: 'E3', title: 'Vendor risk workshop', date: daysFromNow(11), type: 'meeting' },
  { id: 'E4', title: 'Monthly status report due', date: daysFromNow(18), type: 'review' },
]

export const isOverdue = (task) => task.status !== 'completed' && new Date(task.dueDate) < new Date()

export const displayStatus = (task) => (task.status === 'blocked' ? 'blocked' : isOverdue(task) ? 'overdue' : task.status)

export const milestoneStatus = (milestone) => {
  if (milestone.completedAt) return 'completed'
  const related = tasks.filter((t) => t.milestoneId === milestone.id)
  if (new Date(milestone.dueDate) < new Date()) return 'overdue'
  if (related.some((t) => t.progress > 0)) return 'in_progress'
  return 'not_started'
}

export const milestoneProgress = (milestone) => {
  const related = tasks.filter((t) => t.milestoneId === milestone.id)
  if (!related.length) return milestone.completedAt ? 100 : 0
  return Math.round(related.reduce((sum, t) => sum + t.progress, 0) / related.length)
}

export const tasksForControl = (code) => tasks.filter((t) => t.control === code).map((t) => ({ ...t }))

const clone = (task) => ({ ...task, checklist: task.checklist.map((c) => ({ ...c })), comments: task.comments.map((c) => ({ ...c })) })

export async function getPlan() {
  await wait()
  return {
    plan: { ...plan, timeElapsed: Math.round(((Date.now() - new Date(plan.startDate)) / (new Date(plan.endDate) - new Date(plan.startDate))) * 100) },
    milestones: milestones.map((m) => ({ ...m, status: milestoneStatus(m), progress: milestoneProgress(m) })),
    tasks: tasks.map(clone),
    events: events.map((e) => ({ ...e })),
  }
}

export async function getTask(id) {
  await wait(300)
  const task = tasks.find((t) => t.id === id)
  if (!task) {
    const error = new Error('Not found')
    error.response = { status: 404, data: { detail: 'Task not found.' } }
    throw error
  }
  return { task: clone(task), milestone: milestones.find((m) => m.id === task.milestoneId) }
}

export async function updateTask(id, patch) {
  await wait(250)
  const task = tasks.find((t) => t.id === id)
  Object.assign(task, patch)
  if (patch.status === 'completed') task.progress = 100
  return clone(task)
}

export async function toggleChecklistItem(id, itemId) {
  await wait(150)
  const task = tasks.find((t) => t.id === id)
  const item = task.checklist.find((c) => c.id === itemId)
  item.done = !item.done
  return clone(task)
}

export async function addTaskComment(id, text, author) {
  await wait(250)
  const task = tasks.find((t) => t.id === id)
  task.comments.push({ id: `m${task.comments.length + 1}`, author, at: new Date().toISOString(), text })
  return clone(task)
}

export async function createTask(data) {
  await wait(300)
  const task = {
    id: `T-${101 + tasks.length}`,
    progress: 0,
    status: 'not_started',
    startDate: new Date().toISOString(),
    checklist: [],
    comments: [],
    description: '',
    ...data,
  }
  tasks.push(task)
  return clone(task)
}
