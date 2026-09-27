import api from './api'

export const getDashboardStats = async (organisationId) => {
  const params = organisationId ? { organisation_id: organisationId } : {}
  const response = await api.get('/dashboard/stats', { params })
  return response.data
}

export const getScoresParSysteme = async (organisationId) => {
  const params = organisationId ? { organisation_id: organisationId } : {}
  const response = await api.get('/dashboard/scores-par-systeme', { params })
  return response.data
}

export const getNonConformitesParDepartement = async (organisationId) => {
  const params = organisationId ? { organisation_id: organisationId } : {}
  const response = await api.get('/dashboard/non-conformites-par-departement', { params })
  return response.data
}

export const getActionsPrioritaires = async (organisationId) => {
  const params = organisationId ? { organisation_id: organisationId } : {}
  const response = await api.get('/dashboard/actions-prioritaires', { params })
  return response.data
}