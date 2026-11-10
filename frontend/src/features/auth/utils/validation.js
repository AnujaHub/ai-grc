export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export const isStrongPassword = (value) => PASSWORD_RULES.every((rule) => rule.test(value))

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

export function validateRegister(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!form.email.trim()) errors.email = 'Work email is required.'
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.'
  if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number.'
  if (!form.organisation.trim()) errors.organisation = 'Organisation is required.'
  if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required.'
  if (!form.password) errors.password = 'Password is required.'
  else if (!isStrongPassword(form.password)) errors.password = 'Password does not meet all requirements.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  if (!form.acceptTerms) errors.acceptTerms = 'You must accept the terms to continue.'
  return errors
}

export function validateResetPassword({ password, confirmPassword }) {
  const errors = {}
  if (!password) errors.password = 'Password is required.'
  else if (!isStrongPassword(password)) errors.password = 'Password does not meet all requirements.'
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}
