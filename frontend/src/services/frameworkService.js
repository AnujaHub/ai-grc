import api from './api'

export const getReferentiels = async () => {
  const response = await api.get('/frameworks/')
  return response.data
}

export const getChapitres = async (referentielId) => {
  const response = await api.get(`/frameworks/${referentielId}/chapters`)
  return response.data
}