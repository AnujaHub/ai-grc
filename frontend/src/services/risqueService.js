import api from './api'

export const getRisques = async () => {
  const response = await api.get('/risques/')
  return response.data
}

export const getRisqueDetail = async (risqueId) => {
  const response = await api.get(`/risques/${risqueId}`)
  return response.data
}

export const createRisque = async (risque) => {
  const response = await api.post('/risques/', risque)
  return response.data
}

export const updateStatutRisque = async (risqueId, nouveauStatut) => {
  const response = await api.patch(`/risques/${risqueId}/statut?nouveau_statut=${nouveauStatut}`)
  return response.data
}

export const createActionCorrective = async (risqueId, action) => {
  const response = await api.post(`/risques/${risqueId}/actions`, action)
  return response.data
}

export const updateStatutAction = async (actionId, nouveauStatut) => {
  const response = await api.patch(`/risques/actions/${actionId}/statut?nouveau_statut=${nouveauStatut}`)
  return response.data
}

export const genererRisquesIA = async (evaluationId) => {
  const response = await api.post(`/risques/generer-ia/${evaluationId}`)
  return response.data
}