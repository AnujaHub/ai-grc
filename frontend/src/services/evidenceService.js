import api from './api'

export const getPreuvesPourReponse = async (reponseId) => {
  const response = await api.get(`/preuves/reponse/${reponseId}`)
  return response.data
}

export const uploadPreuve = async (reponseId, file, description) => {
  const formData = new FormData()
  formData.append('reponse_id', reponseId)
  formData.append('fichier', file)
  if (description) {
    formData.append('description', description)
  }

  const response = await api.post('/preuves/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const telechargerPreuve = (preuveId) => {
  return `http://127.0.0.1:8000/preuves/${preuveId}/telecharger`
}

export const supprimerPreuve = async (preuveId) => {
  const response = await api.delete(`/preuves/${preuveId}`)
  return response.data
}

export const analyserPreuve = async (preuveId) => {
  const response = await api.post(`/preuves/${preuveId}/analyser`)
  return response.data
}