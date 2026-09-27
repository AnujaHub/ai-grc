import api from './api'

export const getReferentiels = async () => {
  const response = await api.get('/referentiels/')
  return response.data
}

export const getChapitres = async (referentielId) => {
  const response = await api.get(`/referentiels/${referentielId}/chapitres`)
  return response.data
}