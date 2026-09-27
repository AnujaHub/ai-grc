import { useState, useEffect } from 'react'
import api from '../services/api'
import { getPreuvesPourReponse, uploadPreuve, supprimerPreuve, analyserPreuve } from '../services/preuveService'

const COULEUR_VERDICT = {
  'Pertinente': 'bg-accent-soft text-accent',
  'Insuffisante': 'bg-warning-soft text-warning',
  'Non liée': 'bg-danger-soft text-danger',
}

function GestionPreuves({ reponseId }) {
  const [preuves, setPreuves] = useState([])
  const [fichier, setFichier] = useState(null)
  const [description, setDescription] = useState('')
  const [erreur, setErreur] = useState('')
  const [analyseEnCours, setAnalyseEnCours] = useState(null)

  useEffect(() => { if (reponseId) chargerPreuves() }, [reponseId])

  const chargerPreuves = async () => {
    try {
      const data = await getPreuvesPourReponse(reponseId)
      setPreuves(data)
    } catch (err) {
      setErreur('Impossible de charger les preuves')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!fichier) { alert('Choisis un fichier avant d\'envoyer'); return }
    try {
      await uploadPreuve(reponseId, fichier, description)
      setFichier(null); setDescription('')
      chargerPreuves()
    } catch (err) {
      setErreur('Erreur lors de l\'envoi du fichier (format ou taille invalide)')
    }
  }

  const handleDelete = async (preuveId) => {
    if (!confirm('Supprimer cette preuve ?')) return
    try {
      await supprimerPreuve(preuveId)
      chargerPreuves()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleAnalyser = async (preuveId) => {
    setAnalyseEnCours(preuveId)
    try {
      await analyserPreuve(preuveId)
      chargerPreuves()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'analyse IA')
    } finally {
      setAnalyseEnCours(null)
    }
  }

  const handleTelecharger = async (preuveId, nomFichier) => {
    try {
      const response = await api.get(`/preuves/${preuveId}/telecharger`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nomFichier)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Erreur lors du téléchargement')
    }
  }

  const analysePossible = (typeFichier) => ['pdf', 'png', 'jpg', 'jpeg'].includes(typeFichier)

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-2">Preuves documentaires</p>

      {erreur && <p className="text-danger text-xs mb-2">{erreur}</p>}

      {preuves.length > 0 && (
        <ul className="space-y-2 mb-3">
          {preuves.map((p) => (
            <li key={p.id} className="bg-paper border border-line px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink truncate">{p.nom_fichier}</span>
                <span className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-mono text-xs text-ink-soft">{Math.round(p.taille / 1024)} Ko</span>
                  {analysePossible(p.type_fichier) && (
                    <button
                      onClick={() => handleAnalyser(p.id)}
                      disabled={analyseEnCours === p.id}
                      className="text-xs text-ink-soft hover:text-ink cursor-pointer disabled:opacity-50"
                    >
                      {analyseEnCours === p.id ? 'Analyse...' : p.analyse_verdict ? 'Ré-analyser' : 'Analyser (IA)'}
                    </button>
                  )}
                  <button onClick={() => handleTelecharger(p.id, p.nom_fichier)} className="text-xs text-accent hover:underline cursor-pointer">
                    Télécharger
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-danger hover:underline cursor-pointer">
                    Supprimer
                  </button>
                </span>
              </div>

              {p.analyse_verdict && (
                <div className="mt-2 pt-2 border-t border-line/60">
                  <span className={`inline-block px-2 py-0.5 text-xs font-mono font-medium ${COULEUR_VERDICT[p.analyse_verdict] || ''}`}>
                    {p.analyse_verdict}
                  </span>
                  <p className="text-ink-soft text-xs mt-1.5">{p.analyse_details}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap gap-2 items-center">
        <input
          type="file"
          onChange={(e) => setFichier(e.target.files[0])}
          className="text-xs text-ink-soft"
        />
        <input
          type="text"
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[160px] px-2 py-1.5 border border-line focus:border-accent outline-none text-xs bg-paper"
        />
        <button type="submit" className="px-3 py-1.5 border border-ink text-ink text-xs font-medium cursor-pointer hover:bg-ink hover:text-white">
          Ajouter la preuve
        </button>
      </form>
    </div>
  )
}

export default GestionPreuves