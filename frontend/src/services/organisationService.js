import api from './api'

export const getOrganisations = async () => {
  const response = await api.get('/organisations/')
  return response.data
}

export const createOrganisation = async (nom, secteur, pays) => {
  const response = await api.post('/organisations/', {
    nom: nom,
    secteur: secteur,
    pays: pays,
  })
  return response.data
}