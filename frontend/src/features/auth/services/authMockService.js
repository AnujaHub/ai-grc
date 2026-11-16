export const DEMO_CODE = '123456'

export const MFA_ENABLED_FOR_DEMO = false

const wait = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

const fail = (message) => {
  const error = new Error(message)
  error.response = { data: { detail: message } }
  throw error
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
