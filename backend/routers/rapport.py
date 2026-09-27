from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.evaluation import Evaluation
from models.reponse import Reponse
from models.clause import Clause
from models.chapitre import Chapitre
from models.systeme_ia import SystemeIA
from models.organisation import Organisation
from models.referentiel import Referentiel
from models.risque import Risque
from models.rapport import Rapport
from models.utilisateur import Utilisateur
from schemas.rapport import RapportOut
from security import get_current_user
from rapport_service import generer_rapport_pdf
from groq_service import generer_synthese_rapport
from typing import List
from uuid import UUID
import os

router = APIRouter(prefix="/rapports", tags=["Rapports"])


def rassembler_donnees_rapport(evaluation_id: UUID, db: Session):
    from models.action_corrective import ActionCorrective
    from models.configuration_risque import ConfigurationRisque

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    referentiel = db.query(Referentiel).filter(Referentiel.id == evaluation.referentiel_id).first()

    if evaluation.type_evaluation == "Systeme_IA":
        systeme = db.query(SystemeIA).filter(SystemeIA.id == evaluation.systeme_ia_id).first()
        organisation = db.query(Organisation).filter(Organisation.id == systeme.organisation_id).first() if systeme else None
        systeme_ia_nom = systeme.nom if systeme else None
        systeme_ia_description = systeme.description if systeme else None
        systeme_ia_criticite = systeme.niveau_criticite if systeme else None
        organisation_id_reelle = systeme.organisation_id if systeme else None
    else:
        organisation = db.query(Organisation).filter(Organisation.id == evaluation.organisation_id).first()
        systeme_ia_nom = None
        systeme_ia_description = None
        systeme_ia_criticite = None
        organisation_id_reelle = evaluation.organisation_id

    reponses = db.query(Reponse).filter(Reponse.evaluation_id == evaluation_id).all()
    reponses_par_clause = {r.clause_id: r for r in reponses}

    chapitres_bd = db.query(Chapitre).filter(Chapitre.referentiel_id == evaluation.referentiel_id).all()

    chapitres_donnees = []
    nb_clauses_totales = 0
    nb_clauses_non_conformes = 0

    for chapitre in chapitres_bd:
        clauses_bd = db.query(Clause).filter(
            Clause.chapitre_id == chapitre.id,
            Clause.type_evaluation == evaluation.type_evaluation
        ).order_by(Clause.ordre).all()

        if not clauses_bd:
            continue

        clauses_info = []
        for clause in clauses_bd:
            reponse = reponses_par_clause.get(clause.id)
            nb_clauses_totales += 1
            ecart = None
            if reponse:
                if reponse.reponse == "Non conforme":
                    ecart = "Majeur"
                    nb_clauses_non_conformes += 1
                elif reponse.reponse == "Partiellement conforme":
                    ecart = "Modéré"
                    nb_clauses_non_conformes += 1
                elif reponse.reponse == "Conforme":
                    ecart = "Aucun"

            clauses_info.append({
                "numero": clause.numero,
                "titre": clause.titre,
                "reponse": reponse.reponse if reponse else None,
                "commentaire": reponse.commentaire if reponse else None,
                "ecart": ecart,
                "departement": clause.departement_suggere,
            })

        chapitres_donnees.append({
            "numero": chapitre.numero,
            "titre": chapitre.titre,
            "clauses": clauses_info,
        })

    risques_bd = db.query(Risque).filter(Risque.evaluation_id == evaluation_id).all()

    risques_donnees = []
    for r in risques_bd:
        actions_bd = db.query(ActionCorrective).filter(ActionCorrective.risque_id == r.id).all()
        actions_info = [{
            "titre": a.titre,
            "description": a.description,
            "date_echeance": a.date_echeance.strftime('%d/%m/%Y') if a.date_echeance else "Non définie",
            "statut": a.statut,
        } for a in actions_bd]

        risques_donnees.append({
            "titre": r.titre,
            "description": r.description,
            "categorie": r.categorie,
            "impact": r.impact,
            "probabilite": r.probabilite,
            "niveau_risque": r.niveau_risque,
            "statut": r.statut,
            "actions": actions_info,
        })

    nb_risques_eleves = sum(1 for r in risques_bd if r.niveau_risque == "Élevé")
    nb_risques_ouverts = sum(1 for r in risques_bd if r.statut == "Ouvert")

    # Configuration de la matrice de risque de l'organisation
    config_matrice = None
    if organisation_id_reelle:
        config_matrice = db.query(ConfigurationRisque).filter(
            ConfigurationRisque.organisation_id == organisation_id_reelle
        ).first()

    niveaux_impact = config_matrice.niveaux_impact if config_matrice else ["Faible", "Moyen", "Élevé"]
    niveaux_probabilite = config_matrice.niveaux_probabilite if config_matrice else ["Faible", "Moyen", "Élevée"]

    return {
        "evaluation_id": str(evaluation_id),
        "organisation_nom": organisation.nom if organisation else "Organisation inconnue",
        "organisation_secteur": organisation.secteur if organisation else None,
        "organisation_pays": organisation.pays if organisation else None,
        "systeme_ia_nom": systeme_ia_nom,
        "systeme_ia_description": systeme_ia_description,
        "systeme_ia_criticite": systeme_ia_criticite,
        "referentiel_nom": referentiel.nom if referentiel else "Référentiel inconnu",
        "score": float(evaluation.score) if evaluation.score is not None else 0,
        "chapitres": chapitres_donnees,
        "risques": risques_donnees,
        "nb_risques_eleves": nb_risques_eleves,
        "nb_risques_ouverts": nb_risques_ouverts,
        "nb_clauses_non_conformes": nb_clauses_non_conformes,
        "nb_clauses_totales": nb_clauses_totales,
        "type_evaluation": evaluation.type_evaluation,
        "niveaux_impact": niveaux_impact,
        "niveaux_probabilite": niveaux_probabilite,
    }

@router.post("/generer/{evaluation_id}", response_model=RapportOut)
def generer_rapport(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    donnees = rassembler_donnees_rapport(evaluation_id, db)

    # Génère la synthèse par IA (si ça échoue, le rapport se génère quand même avec un texte de secours)
    try:
        synthese_ia = generer_synthese_rapport(
            nom_cible=donnees['systeme_ia_nom'] or donnees['organisation_nom'],
            type_evaluation=donnees['type_evaluation'],
            score=donnees['score'],
            nb_risques_eleves=donnees['nb_risques_eleves'],
            nb_risques_ouverts=donnees['nb_risques_ouverts'],
            nb_clauses_non_conformes=donnees['nb_clauses_non_conformes'],
            nb_clauses_totales=donnees['nb_clauses_totales'],
        )
    except Exception:
        synthese_ia = None

    donnees['synthese_ia'] = synthese_ia

    chemin_fichier = generer_rapport_pdf(donnees)

    nouveau_rapport = Rapport(
        evaluation_id=evaluation_id,
        score_global=donnees['score'],
        chemin_fichier=chemin_fichier,
    )
    db.add(nouveau_rapport)
    db.commit()
    db.refresh(nouveau_rapport)

    return nouveau_rapport


@router.get("/", response_model=List[RapportOut])
def list_rapports(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Rapport).order_by(Rapport.date_generation.desc()).all()


@router.get("/{rapport_id}/telecharger")
def telecharger_rapport(
    rapport_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    rapport = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    if not os.path.exists(rapport.chemin_fichier):
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")

    return FileResponse(rapport.chemin_fichier, filename=f"rapport_conformite_{rapport_id}.pdf", media_type="application/pdf")