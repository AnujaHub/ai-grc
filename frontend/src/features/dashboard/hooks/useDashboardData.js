import { useCallback, useEffect, useState } from 'react'

export default function useDashboardData(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loader()
      .then((data) => active && setState({ data, loading: false, error: '' }))
      .catch((err) =>
        active && setState({ data: null, loading: false, error: err.response?.data?.detail || 'Unable to load the dashboard.' }),
      )
    return () => {
      active = false
    }
  }, [loader, attempt])

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    setAttempt((n) => n + 1)
  }, [])

  const setData = useCallback(
    (updater) => setState((current) => ({ ...current, data: typeof updater === 'function' ? updater(current.data) : updater })),
    [],
  )

  return { ...state, reload, setData }
}
