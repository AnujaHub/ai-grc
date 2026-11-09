import { useEffect, useState, useCallback } from 'react'

export default function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) return undefined
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  const restart = useCallback((value = seconds) => setRemaining(value), [seconds])

  return { remaining, isDone: remaining <= 0, restart }
}

export const formatSeconds = (total) => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
