const DAY = 24 * 60 * 60 * 1000

const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const daysUntil = (iso) => Math.round((startOfDay(iso) - startOfDay(new Date())) / DAY)

export function dueLabel(iso) {
  const days = daysUntil(iso)
  if (days < -1) return `Overdue by ${-days} days`
  if (days === -1) return 'Overdue by 1 day'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

export const dueTone = (iso) => {
  const days = daysUntil(iso)
  if (days < 0) return 'text-danger'
  if (days <= 2) return 'text-warning'
  return 'text-ink-soft'
}

export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso)) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

export const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const scoreTone = (score) => (score >= 75 ? 'accent' : score >= 50 ? 'warning' : 'danger')
