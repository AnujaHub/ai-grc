import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email: email,
    mot_de_passe: password,
  })
  return response.data
}

export const register = async (nom, prenom, email, password) => {
  const response = await api.post('/auth/register', {
    nom: nom,
    prenom: prenom,
    email: email,
    mot_de_passe: password,
  })
  return response.data
}

export const getMonProfil = async () => {
  const response = await api.get('/auth/moi')
  return response.data
}

export const changerMotDePasse = async (ancienMotDePasse, nouveauMotDePasse) => {
  const response = await api.post('/auth/changer-mot-de-passe', {
    ancien_mot_de_passe: ancienMotDePasse,
    nouveau_mot_de_passe: nouveauMotDePasse,
  })
  return response.data
}