export const DEMO_CODE = '123456'

export const MFA_ENABLED_FOR_DEMO = false

const wait = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

const fail = (message) => {
  const error = new Error(message)
  error.response = { data: { detail: message } }
  throw error
}

export async function registerUser(form) {
  await wait()
  if (form.email.toLowerCase() === 'taken@test.com') {
    fail('An account with this email already exists.')
  }
  return { email: form.email, status: 'pending_verification' }
}

export async function sendOtp(email) {
  await wait(600)
  return { sentTo: email, expiresInSeconds: 300 }
}

export async function verifyOtp(email, code) {
  await wait()
  if (code !== DEMO_CODE) fail('The code is incorrect. Please try again.')
  return { verified: true }
}

export async function getMfaSetup() {
  await wait(500)
  return {
    secret: 'JBSW Y3DP EHPK 3PXP',
    issuer: 'Nova GRC',
    account: 'you@company.com',
  }
}

export async function verifyMfaCode(code) {
  await wait()
  if (code !== DEMO_CODE) fail('Invalid authentication code.')
  return { verified: true }
}

export async function requestPasswordReset(email) {
  await wait()
  return { sentTo: email }
}

export async function resetPassword(token, password) {
  await wait()
  if (token === 'expired') fail('This reset link has expired.')
  return { reset: true, password: Boolean(password) }
}
