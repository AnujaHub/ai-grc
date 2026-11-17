import api from './api'

export const getUtilisateurs = async () => {
  const response = await api.get('/users/')
  return response.data
}

export const creerUtilisateur = async (utilisateur) => {
  const response = await api.post('/users/', utilisateur)
  return response.data
}

export const modifierUtilisateur = async (utilisateurId, donnees) => {
  const response = await api.patch(`/users/${utilisateurId}`, donnees)
  return response.data
}