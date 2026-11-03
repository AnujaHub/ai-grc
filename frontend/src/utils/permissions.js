// Rôles autorisés à créer/modifier du contenu (aligné sur le RBAC backend)
const ROLES_EDITION = ['super_admin', 'administrateur', 'responsable_conformite']

export const peutEditer = () => {
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null')
  return utilisateur && ROLES_EDITION.includes(utilisateur.role)
}

export const estAdministrateur = () => {
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null')
  return utilisateur && ['administrateur', 'super_admin'].includes(utilisateur.role)
}