import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from './Logo'

const LIENS = [
  { chemin: '/dashboard', label: 'Dashboard' },
  { chemin: '/organisations', label: 'Organizations' },
  { chemin: '/systemes-ia', label: 'AI systems' },
  { chemin: '/evaluations', label: 'Assessments' },
  { chemin: '/risques', label: 'Risks' },
  { chemin: '/rapports', label: 'Reports' },
  { chemin: '/utilisateurs', label: 'Users', rolesRequis: ['super_admin', 'administrateur'] },
  { chemin: '/journal-audit', label: 'Audit log', rolesRequis: ['super_admin', 'administrateur', 'auditeur'] },
]

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('utilisateur')
    navigate('/')
  }

  const initiales = utilisateur
    ? `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase()
    : '?'

  return (
    <nav className="bg-white border-b border-line sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="hidden md:flex items-center gap-1">
{LIENS.filter((lien) => {
              if (lien.roleRequis) return lien.roleRequis === utilisateur?.role
              if (lien.rolesRequis) return lien.rolesRequis.includes(utilisateur?.role)
              return true
            }).map((lien) => {              const actif = location.pathname === lien.chemin
              return (
                <button
                  key={lien.chemin}
                  onClick={() => navigate(lien.chemin)}
                  className={`relative px-3.5 py-2 text-sm font-medium cursor-pointer ${
                    actif ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {lien.label}
                  {actif && (
                    <motion.div
                      layoutId="navbar-indicateur"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {utilisateur && (
              <button
                onClick={() => navigate('/profil')}
                className="hidden sm:flex items-center gap-2.5 cursor-pointer hover:opacity-70"
              >
                <div className="w-8 h-8 rounded-full border border-ink flex items-center justify-center font-mono text-xs text-ink">
                  {initiales}
                </div>
                <div className="text-sm text-left">
                  <p className="font-medium text-ink leading-tight">{utilisateur.prenom} {utilisateur.nom}</p>
                  <p className="text-ink-soft text-xs leading-tight capitalize font-mono">{utilisateur.role?.replace('_', ' ')}</p>
                </div>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-ink-soft hover:text-danger px-3 py-2 cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {LIENS.filter((lien) => {
            if (lien.roleRequis) return lien.roleRequis === utilisateur?.role
            if (lien.rolesRequis) return lien.rolesRequis.includes(utilisateur?.role)
            return true
          }).map((lien) => {
            const actif = location.pathname === lien.chemin
            return (
              <button
                key={lien.chemin}
                onClick={() => navigate(lien.chemin)}
                className={`whitespace-nowrap px-2 py-1.5 text-xs font-medium border-b-2 cursor-pointer ${
                  actif ? 'border-accent text-ink' : 'border-transparent text-ink-soft'
                }`}
              >
                {lien.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar