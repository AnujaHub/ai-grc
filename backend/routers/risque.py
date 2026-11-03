from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.risque import Risque
from models.action_corrective import ActionCorrective
from models.evaluation import Evaluation
from models.systeme_ia import SystemeIA
from models.configuration_risque import ConfigurationRisque
from models.utilisateur import Utilisateur
from schemas.risque import RisqueCreate, RisqueOut, RisqueDetailOut, ActionCorrectiveCreate, ActionCorrectiveOut
from security import get_current_user
from typing import List
from uuid import UUID
from security import require_roles

router = APIRouter(prefix="/risques", tags=["Risques"])


def get_organisation_id_pour_evaluation(evaluation: Evaluation, db: Session) -> UUID:
    """Retrouve l'organisation concernée, que l'évaluation soit de type Organisation ou Systeme_IA."""
    if evaluation.type_evaluation == "Organisation":
        return evaluation.organisation_id
    else:
        systeme = db.query(SystemeIA).filter(SystemeIA.id == evaluation.systeme_ia_id).first()
        return systeme.organisation_id if systeme else None


def calculer_niveau_risque_dynamique(impact: str, probabilite: str, organisation_id: UUID, db: Session) -> str:
    """
    Calcule le niveau de risque (Faible/Moyen/Élevé) à partir d'un impact et d'une probabilité,
    quel que soit le nombre de niveaux configurés par l'organisation (3, 4, 5...).
    """
    config = db.query(ConfigurationRisque).filter(
        ConfigurationRisque.organisation_id == organisation_id
    ).first()

    niveaux_impact = config.niveaux_impact if config else ["Faible", "Moyen", "Élevé"]
    niveaux_probabilite = config.niveaux_probabilite if config else ["Faible", "Moyen", "Élevée"]

    try:
        index_impact = niveaux_impact.index(impact)
        index_prob = niveaux_probabilite.index(probabilite)
    except ValueError:
        # Si la valeur reçue ne correspond à aucun niveau connu, on retombe sur "Moyen"
        return "Moyen"

    # Normalise chaque index entre 0 et 1
    norm_impact = index_impact / (len(niveaux_impact) - 1) if len(niveaux_impact) > 1 else 0
    norm_prob = index_prob / (len(niveaux_probabilite) - 1) if len(niveaux_probabilite) > 1 else 0

    score = (norm_impact + norm_prob) / 2  # entre 0 et 1

    if score <= 0.33:
        return "Faible"
    elif score <= 0.66:
        return "Moyen"
    else:
        return "Élevé"


@router.post("/", response_model=RisqueOut)
def create_risque(
    data: RisqueCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == data.evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    organisation_id = get_organisation_id_pour_evaluation(evaluation, db)
    niveau = calculer_niveau_risque_dynamique(data.impact, data.probabilite, organisation_id, db)

    nouveau_risque = Risque(
        evaluation_id=data.evaluation_id,
        titre=data.titre,
        description=data.description,
        categorie=data.categorie,
        impact=data.impact,
        probabilite=data.probabilite,
        niveau_risque=niveau,
    )
    db.add(nouveau_risque)
    db.commit()
    db.refresh(nouveau_risque)

    from audit_logger import enregistrer_action
    enregistrer_action(db, current_user, "creation", "Risque", str(nouveau_risque.id), f"Titre : {nouveau_risque.titre}, Niveau : {niveau}")

    return nouveau_risque


@router.get("/", response_model=List[RisqueOut])
def list_risques(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Risque).all()


@router.get("/{risque_id}", response_model=RisqueDetailOut)
def get_risque(
    risque_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    risque = db.query(Risque).filter(Risque.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risque non trouvé")
    return risque


@router.patch("/{risque_id}/statut", response_model=RisqueOut)
def update_statut_risque(
    risque_id: UUID,
    nouveau_statut: str,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    risque = db.query(Risque).filter(Risque.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risque non trouvé")

    risque.statut = nouveau_statut
    db.commit()
    db.refresh(risque)
    return risque


@router.post("/{risque_id}/actions", response_model=ActionCorrectiveOut)
def create_action_corrective(
    risque_id: UUID,
    data: ActionCorrectiveCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    risque = db.query(Risque).filter(Risque.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risque non trouvé")

    nouvelle_action = ActionCorrective(
        risque_id=risque_id,
        titre=data.titre,
        description=data.description,
        responsable_id=data.responsable_id,
        date_echeance=data.date_echeance,
    )
    db.add(nouvelle_action)
    db.commit()
    db.refresh(nouvelle_action)
    return nouvelle_action


@router.patch("/actions/{action_id}/statut", response_model=ActionCorrectiveOut)
def update_statut_action(
    action_id: UUID,
    nouveau_statut: str,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    from datetime import date

    action = db.query(ActionCorrective).filter(ActionCorrective.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action corrective non trouvée")

    action.statut = nouveau_statut
    if nouveau_statut == "Terminée":
        action.date_cloture = date.today()

    db.commit()
    db.refresh(action)
    return action


@router.post("/generer-ia/{evaluation_id}")
def generer_risques_par_ia(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    from models.reponse import Reponse
    from models.clause import Clause
    from models.systeme_ia import SystemeIA
    from groq_service import generer_risques_et_actions

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    if evaluation.type_evaluation == "Systeme_IA":
        systeme_ia = db.query(SystemeIA).filter(SystemeIA.id == evaluation.systeme_ia_id).first()
        nom_contexte = systeme_ia.nom if systeme_ia else "Système IA"
    else:
        nom_contexte = "Gouvernance de l'organisation"

    reponses = db.query(Reponse).filter(
        Reponse.evaluation_id == evaluation_id,
        Reponse.reponse.in_(["Non conforme", "Partiellement conforme"])
    ).all()

    if not reponses:
        return {"message": "Aucune non-conformité détectée, aucun risque à générer.", "risques_crees": []}

    donnees_pour_ia = []
    for r in reponses:
        clause = db.query(Clause).filter(Clause.id == r.clause_id).first()
        donnees_pour_ia.append({
            "clause_titre": clause.titre if clause else "Inconnue",
            "clause_description": clause.description if clause else "",
            "reponse": r.reponse,
            "commentaire": r.commentaire,
        })

    risques_suggeres = generer_risques_et_actions(nom_contexte, donnees_pour_ia)
    organisation_id = get_organisation_id_pour_evaluation(evaluation, db)

    risques_crees = []
    for suggestion in risques_suggeres:
        niveau = calculer_niveau_risque_dynamique(
            suggestion.get("impact", "Moyen"),
            suggestion.get("probabilite", "Moyen"),
            organisation_id,
            db
        )
        nouveau_risque = Risque(
            evaluation_id=evaluation_id,
            titre=suggestion.get("titre", "Risque identifié par IA"),
            description=suggestion.get("description", ""),
            categorie=suggestion.get("categorie", "Général"),
            impact=suggestion.get("impact", "Moyen"),
            probabilite=suggestion.get("probabilite", "Moyen"),
            niveau_risque=niveau,
        )
        db.add(nouveau_risque)
        db.commit()
        db.refresh(nouveau_risque)

        action_data = suggestion.get("action_corrective", {})
        if action_data:
            nouvelle_action = ActionCorrective(
                risque_id=nouveau_risque.id,
                titre=action_data.get("titre", "Action corrective suggérée"),
                description=action_data.get("description", ""),
            )
            db.add(nouvelle_action)
            db.commit()

        risques_crees.append(nouveau_risque)

    return {
        "message": f"{len(risques_crees)} risque(s) généré(s) par l'IA avec succès.",
        "risques_crees": [r.id for r in risques_crees]
    }