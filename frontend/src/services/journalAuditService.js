import api from './api'

export const getJournalAudit = async (ressourceType) => {
  const params = ressourceType ? { ressource_type: ressourceType } : {}
  const response = await api.get('/journal-audit/', { params })
  return response.data
}