import api from './api'

export const getConfigurationRisque = async (organisationId) => {
  const response = await api.get(`/configuration-risque/${organisationId}`)
  return response.data
}

export const updateConfigurationRisque = async (organisationId, niveauxImpact, niveauxProbabilite) => {
  const response = await api.put(`/configuration-risque/${organisationId}`, {
    niveaux_impact: niveauxImpact,
    niveaux_probabilite: niveauxProbabilite,
  })
  return response.data
}