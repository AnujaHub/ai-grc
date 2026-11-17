import api from './api'

export const genererRapport = async (evaluationId) => {
  const response = await api.post(`/reports/generer/${evaluationId}`)
  return response.data
}

export const getRapports = async () => {
  const response = await api.get('/reports/')
  return response.data
}

export const telechargerRapport = async (rapportId) => {
  const response = await api.get(`/reports/${rapportId}/telecharger`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `rapport_conformite_${rapportId}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
export const visualiserRapport = async (rapportId) => {
  const response = await api.get(`/reports/${rapportId}/telecharger`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  window.open(url, '_blank')
}