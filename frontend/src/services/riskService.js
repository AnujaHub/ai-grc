import api from './api'

export const getRisques = async () => {
  const response = await api.get('/risks/')
  return response.data
}

export const getRisqueDetail = async (risqueId) => {
  const response = await api.get(`/risks/${risqueId}`)
  return response.data
}

export const createRisque = async (risque) => {
  const response = await api.post('/risks/', risque)
  return response.data
}

export const updateStatutRisque = async (risqueId, nouveauStatut) => {
  const response = await api.patch(`/risks/${risqueId}/status?nouveau_statut=${nouveauStatut}`)
  return response.data
}

export const createActionCorrective = async (risqueId, action) => {
  const response = await api.post(`/risks/${risqueId}/actions`, action)
  return response.data
}

export const updateStatutAction = async (actionId, nouveauStatut) => {
  const response = await api.patch(`/risks/actions/${actionId}/status?nouveau_statut=${nouveauStatut}`)
  return response.data
}

export const genererRisquesIA = async (evaluationId) => {
  const response = await api.post(`/risks/generer-ia/${evaluationId}`)
  return response.data
}