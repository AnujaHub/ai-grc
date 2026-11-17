import api from './api'

export const getDashboardStats = async (organisationId) => {
  const params = organisationId ? { organization_id: organisationId } : {}
  const response = await api.get('/dashboard/stats', { params })
  return response.data
}

export const getScoresParSysteme = async (organisationId) => {
  const params = organisationId ? { organization_id: organisationId } : {}
  const response = await api.get('/dashboard/scores-par-systeme', { params })
  return response.data
}

export const getNonConformitesParDepartement = async (organisationId) => {
  const params = organisationId ? { organization_id: organisationId } : {}
  const response = await api.get('/dashboard/non-conformites-par-departement', { params })
  return response.data
}

export const getActionsPrioritaires = async (organisationId) => {
  const params = organisationId ? { organization_id: organisationId } : {}
  const response = await api.get('/dashboard/actions-prioritaires', { params })
  return response.data
}

const emptyDashboardCollections = {
  complianceByOrganisation: [],
  roleDistribution: [],
  pendingRegistrations: [],
  organizations: [],
  activity: [],
  controlStatus: [],
  domainCompliance: [],
  tasksByStatus: [],
  approvals: [],
  deadlines: [],
  team: [],
}

export const getAdminDashboard = async () => {
  const stats = await getDashboardStats()
  return {
    ...emptyDashboardCollections,
    organisation: 'Current organisation',
    kpis: {
      complianceScore: { value: stats.score_moyen_conformite, change: 0 },
      controls: { implemented: stats.nb_evaluations_terminees, total: stats.nb_evaluations },
      tasks: { open: stats.corrective_actions.ouvertes, overdue: stats.corrective_actions.en_retard },
      pendingApprovals: 0,
      users: { active: 0, total: 0 },
    },
  }
}

export const getSuperAdminDashboard = async () => {
  const stats = await getDashboardStats()
  return {
    ...emptyDashboardCollections,
    kpis: {
      organizations: { total: stats.nb_organisations, active: stats.nb_organisations },
      users: { total: 0, newThisMonth: 0 },
      pendingRegistrations: 0,
      averageCompliance: { value: stats.score_moyen_conformite, change: 0 },
      aiSystems: stats.nb_systemes_ia,
      storage: { usedGb: 0, limitGb: 0 },
    },
  }
}

export const getUserDashboard = async () => {
  const stats = await getDashboardStats()
  const total = stats.nb_evaluations
  const implemented = stats.nb_evaluations_terminees
  return {
    ...emptyDashboardCollections,
    kpis: {
      assignedControls: { total, implemented },
      evidenceRequests: 0,
      dueThisWeek: 0,
      overdue: stats.corrective_actions.en_retard,
    },
    progress: total ? Math.round((implemented / total) * 100) : 0,
    tasks: [],
    evidenceRequests: [],
    controls: [],
  }
}