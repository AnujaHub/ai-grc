import { REMINDER_DAYS } from '../dashboard/utils/format'

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const ago = (days, hours = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

export const CATEGORIES = [
  { id: 'approval', label: 'Approvals', description: 'Requests waiting for you and decisions on your requests' },
  { id: 'reminder', label: 'Reminders', description: 'Tasks, controls, evidence and reviews that are due soon' },
  { id: 'evidence', label: 'Evidence', description: 'Uploads, reviews and expiring evidence' },
  { id: 'task', label: 'Tasks', description: 'Assignments, comments and status changes' },
  { id: 'ai', label: 'AI insights', description: 'New AI suggestions ready for review' },
  { id: 'system', label: 'Account & security', description: 'Sign-ins, role changes and platform notices' },
]

const notifications = [
  { id: 'n1', type: 'approval', title: 'Evidence awaiting your approval', body: 'Network architecture diagram (EV-1039) was submitted by Arjun Mehta.', at: ago(0, 1), read: false, link: '/approvals/APR-EV-1039' },
  { id: 'n2', type: 'reminder', title: 'Task overdue: Enforce MFA for all privileged accounts', body: 'T-104 was due yesterday and is blocked.', at: ago(0, 2), read: false, link: '/grc-plan/tasks/T-104' },
  { id: 'n3', type: 'ai', title: '3 new AI risk suggestions', body: 'Generated from the latest penetration test report. Review before accepting.', at: ago(0, 4), read: false, link: '/ai?tab=risks' },
  { id: 'n4', type: 'evidence', title: 'Evidence rejected', body: 'External penetration test report: retest evidence for the critical findings is missing.', at: ago(0, 6), read: true, link: '/evidence/EV-1026' },
  { id: 'n5', type: 'task', title: 'You were assigned a task', body: 'T-105 Define log retention and review process, due in 14 days.', at: ago(1, 1), read: false, link: '/grc-plan/tasks/T-105' },
  { id: 'n6', type: 'reminder', title: `Policy review due in ${REMINDER_DAYS} days`, body: 'Access control policy (POL-03) needs its annual review.', at: ago(1, 3), read: true, link: '/evidence/documents/POL-03' },
  { id: 'n7', type: 'approval', title: 'Your risk acceptance was approved', body: 'Delayed patching on the HR kiosk, approved by Anita Desai.', at: ago(2), read: true, link: '/approvals/APR-RA-09' },
  { id: 'n8', type: 'system', title: 'New sign-in from Chrome on Windows', body: 'If this was not you, change your password.', at: ago(2, 5), read: true, link: '/profile' },
  { id: 'n9', type: 'evidence', title: 'Evidence expired', body: 'Backup restore test (EV-1009) expired. Upload a new version.', at: ago(4), read: false, link: '/evidence/EV-1009' },
  { id: 'n10', type: 'task', title: 'New comment on T-101', body: 'Priya Sharma: first results shared with the control owner.', at: ago(5), read: true, link: '/grc-plan/tasks/T-101' },
  { id: 'n11', type: 'ai', title: 'AI report summary ready', body: 'Summary of the Q3 ISO/IEC 27001 assessment report.', at: ago(9), read: true, link: '/ai?tab=summaries' },
  { id: 'n12', type: 'system', title: 'Your role was changed', body: 'You are now a Compliance officer.', at: ago(14), read: true, link: '/profile' },
]

let preferences = {
  channels: Object.fromEntries(CATEGORIES.map((c) => [c.id, { inApp: true, email: ['approval', 'reminder', 'system'].includes(c.id) }])),
  reminderDays: REMINDER_DAYS,
  digest: 'daily',
  digestTime: '08:30',
}

export async function listNotifications() {
  await wait()
  return notifications.map((n) => ({ ...n }))
}

export async function markRead(ids, read = true) {
  await wait(120)
  notifications.forEach((n) => {
    if (ids.includes(n.id)) n.read = read
  })
  return listNotifications()
}

export const unreadCount = () => notifications.filter((n) => !n.read).length

export async function getPreferences() {
  await wait(200)
  return JSON.parse(JSON.stringify(preferences))
}

export async function savePreferences(next) {
  await wait(400)
  preferences = JSON.parse(JSON.stringify(next))
  return getPreferences()
}
