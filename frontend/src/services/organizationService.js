import api from './api'

export const getOrganisations = async () => {
  const response = await api.get('/organizations/')
  return response.data
}

export const createOrganisation = async (name, sector, country) => {
  const response = await api.post('/organizations/', {
    name: name,
    sector: sector,
    country: country,
  })
  return response.data
}