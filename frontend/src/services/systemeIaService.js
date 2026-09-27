import api from './api'

export const getSystemesIA = async () => {
  const response = await api.get('/systemes-ia/')
  return response.data
}

export const createSystemeIA = async (systeme) => {
  const response = await api.post('/systemes-ia/', systeme)
  return response.data
}