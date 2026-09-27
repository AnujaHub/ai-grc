import api from './api'

export const getUtilisateurs = async () => {
  const response = await api.get('/utilisateurs/')
  return response.data
}

export const creerUtilisateur = async (utilisateur) => {
  const response = await api.post('/utilisateurs/', utilisateur)
  return response.data
}

export const modifierUtilisateur = async (utilisateurId, donnees) => {
  const response = await api.patch(`/utilisateurs/${utilisateurId}`, donnees)
  return response.data
}