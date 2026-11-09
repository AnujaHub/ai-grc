import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import Navbar from './Navbar'
import { Button } from './ui'

function AccessDenied() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft text-danger">
          <ShieldX className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">Access denied</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Your role does not have permission to view this page. If you need access, ask your administrator.
        </p>
        <Link to="/dashboard" className="mt-6">
          <Button>Go to my dashboard</Button>
        </Link>
      </main>
    </div>
  )
}

export default AccessDenied
