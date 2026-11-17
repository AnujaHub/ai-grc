import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email: email,
    password: password,
  })
  return response.data
}

export const registerUser = async (form) => {
  const response = await api.post('/auth/register', {
    name: form.lastName,
    first_name: form.firstName,
    email: form.email,
    password: form.password,
    job_title: form.jobTitle,
  })
  return response.data
}

export const register = (name, first_name, email, password, jobTitle) =>
  registerUser({ lastName: name, firstName: first_name, email, password, jobTitle })

export const verifyEmail = async (email, code) => {
  const response = await api.post('/auth/verify-email', { email, code })
  return response.data
}

export const resendVerificationEmail = async (email) => {
  const response = await api.post('/auth/resend-verification', { email })
  return response.data
}

export const getMonProfil = async () => {
  const response = await api.get('/auth/moi')
  return response.data
}

export const getGoogleLoginUrl = () => `${api.defaults.baseURL}/auth/google/login`

export const changerMotDePasse = async (ancienMotDePasse, nouveauMotDePasse) => {
  const response = await api.post('/auth/changer-mot-de-passe', {
    current_password: ancienMotDePasse,
    new_password: nouveauMotDePasse,
  })
  return response.data
}