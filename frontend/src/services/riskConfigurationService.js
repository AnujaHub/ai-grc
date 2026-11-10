import api from './api'

export const getConfigurationRisque = async (organisationId) => {
  const response = await api.get(`/configuration-risque/${organisationId}`)
  return response.data
}

export const updateConfigurationRisque = async (organisationId, impactLevels, probabilityLevels) => {
  const response = await api.put(`/configuration-risque/${organisationId}`, {
    impact_levels: impactLevels,
    probability_levels: probabilityLevels,
  })
  return response.data
}