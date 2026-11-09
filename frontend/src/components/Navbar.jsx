import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Logo from './Logo'

const LIENS = [
  { path: '/dashboard', label: 'Overview', group: 'Workspace' },
  { path: '/organisations', label: 'Organizations', group: 'Governance' },
  { path: '/systemes-ia', label: 'AI systems', group: 'Governance' },
  { path: '/evaluations', label: 'Assessments', group: 'Compliance' },
  { path: '/risques', label: 'Risk register', group: 'Risk' },
  { path: '/rapports', label: 'Reports', group: 'Compliance' },
  { path: '/utilisateurs', label: 'Users', group: 'Administration', rolesRequis: ['super_admin', 'administrateur'] },
  { path: '/journal-audit', label: 'Audit log', group: 'Administration', rolesRequis: ['super_admin', 'administrateur', 'auditeur'] },
]

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'))

  useEffect(() => {
    document.body.classList.add('app-shell-active')
    return () => document.body.classList.remove('app-shell-active')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('utilisateur')
    navigate('/')
  }

  const initiales = utilisateur
    ? `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase()
    : '?'

  const liensVisibles = LIENS.filter((lien) => !lien.rolesRequis || lien.rolesRequis.includes(utilisateur?.role))
  const groupes = [...new Set(liensVisibles.map((lien) => lien.group))]

  return (
    <>
    <nav className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-[#0d1626] px-4 py-5 flex-col">
      <div className="px-3 mb-8"><Logo /></div>
      <div className="flex-1 space-y-6 overflow-y-auto">
        {groupes.map((groupe) => (
          <div key={groupe}>
            <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft">{groupe}</p>
            <div className="space-y-1">
              {liensVisibles.filter((lien) => lien.group === groupe).map((lien) => {
                const actif = location.pathname === lien.path || location.pathname.startsWith(`${lien.chemin}/`)
                return (
                  <button
                    key={lien.path}
                    onClick={() => navigate(lien.path)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm cursor-pointer ${
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
      <div className="border-t border-line pt-4">
        {utilisateur && (
          <button onClick={() => navigate('/profil')} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-paper-dark rounded-lg cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-mono text-xs">{initiales}</div>
            <div className="min-w-0">
              <p className="font-medium text-ink text-sm truncate">{utilisateur.prenom} {utilisateur.nom}</p>
              <p className="text-ink-soft text-xs capitalize truncate">{utilisateur.role?.replace('_', ' ')}</p>
            </div>
          </button>
        )}
        <button onClick={handleLogout} className="w-full mt-2 px-3 py-2 text-left text-xs text-ink-soft hover:text-danger cursor-pointer">
          Sign out
        </button>
      </div>
    </nav>
    <div className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-[#0d1626] px-4">
      <Logo />
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profil')} className="text-xs text-ink-soft cursor-pointer">
          {initiales}
        </button>
        <button onClick={handleLogout} className="text-xs text-ink-soft hover:text-danger cursor-pointer">
          Sign out
        </button>
      </div>
    </div>
    </>
  )
}

export default Navbar