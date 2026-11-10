export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'administrateur',
  COMPLIANCE_OFFICER: 'responsable_conformite',
  AUDITOR: 'auditeur',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.COMPLIANCE_OFFICER]: 'Compliance officer',
  [ROLES.AUDITOR]: 'Auditor',
}

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('utilisateur') || 'null')
  } catch {
    return null
  }
}

export const getFullName = (user) => [user?.prenom, user?.nom].filter(Boolean).join(' ')

export const hasRole = (user, allowedRoles) => Boolean(user && allowedRoles.includes(user.role))

export const isAuditor = (user) => user?.role === ROLES.AUDITOR

export const canEdit = (user) => Boolean(user) && !isAuditor(user)

export const canReview = (user) => hasRole(user, [ROLES.SUPER_ADMIN, ROLES.ADMIN])
