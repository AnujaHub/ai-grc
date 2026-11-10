export const TOAST_EVENT = 'app-toast'

export function toast(message, variant = 'success') {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { id: `${Date.now()}-${Math.random()}`, message, variant } }))
}
