import { Alert, Button } from '../../../components/ui'
import DashboardShell from './DashboardShell'
import DashboardSkeleton from './DashboardSkeleton'

function DashboardState({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <DashboardShell>
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <Alert variant="error">
          <p>{error}</p>
          <Button variant="secondary" className="mt-3" onClick={onRetry}>Try again</Button>
        </Alert>
      </DashboardShell>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}

export default DashboardState
