import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import RemindersBell from '../features/reminders/RemindersBell'
import { ROLES, ROLE_LABELS, getCurrentUser } from '../utils/roles'

const MANAGERS = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

const LIENS = [
  { path: '/dashboard', label: 'Overview', group: 'Workspace' },
  { path: '/grc-plan', label: 'GRC plan', group: 'Workspace' },
  { path: '/approvals', label: 'Approvals', group: 'Workspace' },
  { path: '/notifications', label: 'Notifications', group: 'Workspace' },
  { path: '/organizations', label: 'Organizations', group: 'Governance', rolesRequis: MANAGERS },
  { path: '/ai-systems', label: 'AI systems', group: 'Governance' },
  { path: '/controls', label: 'Controls', group: 'Compliance' },
  { path: '/assessments', label: 'Assessments', group: 'Compliance' },
  { path: '/evidence', label: 'Evidence & documents', group: 'Compliance' },
  { path: '/ai', label: 'AI insights', group: 'Compliance' },
  { path: '/risks', label: 'Risk register', group: 'Risk' },
  { path: '/reports', label: 'Reports', group: 'Reports & audit' },
  { path: '/audit-log', label: 'Audit log', group: 'Reports & audit', rolesRequis: [...MANAGERS, ROLES.AUDITOR] },
  { path: '/users', label: 'Users', group: 'Administration', rolesRequis: MANAGERS },
]

function NavLinks({ onNavigate }) {
  const location = useLocation()
  const utilisateur = getCurrentUser()
  const liensVisibles = LIENS.filter((lien) => !lien.rolesRequis || lien.rolesRequis.includes(utilisateur?.role))
  const groupes = [...new Set(liensVisibles.map((lien) => lien.group))]

  return (
    <div className="space-y-6">
      {groupes.map((groupe) => (
        <div key={groupe}>
          <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-ink-soft">{groupe}</p>
          <div className="space-y-1">
            {liensVisibles.filter((lien) => lien.group === groupe).map((lien) => {
              const actif = location.pathname === lien.path || location.pathname.startsWith(`${lien.path}/`)
              return (
                <button
                  key={lien.path}
                  onClick={() => onNavigate(lien.path)}
                  aria-current={actif ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm cursor-pointer ${
                    actif ? 'bg-accent-soft text-accent shadow-[inset_3px_0_0_#38d9c2]' : 'text-ink-soft hover:bg-paper-dark hover:text-ink'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {lien.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const utilisateur = getCurrentUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('app-shell-active')
    return () => document.body.classList.remove('app-shell-active')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('utilisateur')
    navigate('/')
  }

  const go = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  const initiales = utilisateur ? `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase() : '?'
  const roleLabel = ROLE_LABELS[utilisateur?.role] || utilisateur?.role

  return (
    <>
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-[#0d1626] px-4 py-5 md:flex">
        <div className="mb-8 flex items-center justify-between pl-3"><Logo /><RemindersBell /></div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks onNavigate={go} />
        </div>
        <div className="border-t border-line pt-4">
          {utilisateur && (
            <button onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-paper-dark cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs text-accent">{initiales}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{utilisateur.prenom} {utilisateur.nom}</p>
                <p className="truncate text-xs text-ink-soft">{roleLabel}</p>
              </div>
            </button>
          )}
          <button onClick={handleLogout} className="mt-2 w-full px-3 py-2 text-left text-xs text-ink-soft hover:text-danger cursor-pointer">
            Sign out
          </button>
        </div>
      </nav>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-[#0d1626] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-ink-soft hover:text-accent cursor-pointer" aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <RemindersBell placement="mobile" />
          <button onClick={() => navigate('/profile')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft font-mono text-[11px] text-accent cursor-pointer" aria-label="Profile">
            {initiales}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-[#0d1626] px-4 py-5">
            <div className="mb-6 flex items-center justify-between pl-3">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-ink-soft hover:text-ink cursor-pointer" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto"><NavLinks onNavigate={go} /></div>
            <div className="border-t border-line pt-4">
              <p className="px-3 text-sm text-ink">{utilisateur?.prenom} {utilisateur?.nom}</p>
              <p className="px-3 text-xs text-ink-soft">{roleLabel}</p>
              <button onClick={handleLogout} className="mt-3 w-full px-3 py-2 text-left text-xs text-ink-soft hover:text-danger cursor-pointer">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
