import Navbar from '../../../components/Navbar'

function DashboardShell({ children }) {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

export default DashboardShell
