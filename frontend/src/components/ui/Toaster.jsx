import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { TOAST_EVENT } from '../../utils/toast'

const STYLES = {
  success: { box: 'border-accent/40', icon: 'text-accent', Icon: CheckCircle2 },
  error: { box: 'border-danger/40', icon: 'text-danger', Icon: AlertCircle },
  warning: { box: 'border-warning/40', icon: 'text-warning', Icon: AlertTriangle },
  info: { box: 'border-line', icon: 'text-sky-300', Icon: Info },
}

function Toaster() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const timers = []
    const onToast = (e) => {
      setToasts((list) => [...list.slice(-3), e.detail])
      timers.push(setTimeout(() => setToasts((list) => list.filter((t) => t.id !== e.detail.id)), 4500))
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast)
      timers.forEach(clearTimeout)
    }
  }, [])

  const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id))

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-96">
      {toasts.map((t) => {
        const { box, icon, Icon } = STYLES[t.variant] || STYLES.info
        return (
          <div key={t.id} role="status" className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-paper-dark px-4 py-3 shadow-2xl ${box}`}>
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded p-0.5 text-ink-soft hover:text-ink cursor-pointer" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default Toaster
