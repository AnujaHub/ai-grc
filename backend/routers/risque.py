from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.risque import Risk
from models.action_corrective import CorrectiveAction
from models.evaluation import Evaluation
from models.systeme_ia import AISystem
from models.configuration_risque import RiskConfiguration
from models.utilisateur import User
from schemas.risque import RiskCreate, RiskOut, RiskDetailOut, CorrectiveActionCreate, CorrectiveActionOut
from security import get_current_user
from typing import List
from uuid import UUID
from security import require_roles

router = APIRouter(prefix="/risques", tags=["Risks"])


def get_organization_id_for_evaluation(evaluation: Evaluation, db: Session) -> UUID:
    """Find the relevant organization for an Organisation or Systeme_IA evaluation."""
    if evaluation.evaluation_type == "Organisation":
        return evaluation.organisation_id
    else:
        systeme = db.query(AISystem).filter(AISystem.id == evaluation.systeme_ia_id).first()
        return systeme.organisation_id if systeme else None


def calculate_dynamic_risk_level(impact: str, probabilite: str, organisation_id: UUID, db: Session) -> str:
    """
    Calculate the risk level (Faible/Moyen/Élevé) from impact and probability,
    regardless of how many levels the organization configured (3, 4, 5, etc.).
    """
    config = db.query(RiskConfiguration).filter(
        RiskConfiguration.organisation_id == organisation_id
    ).first()

    impact_levels = config.impact_levels if config else ["Faible", "Moyen", "Élevé"]
    probability_levels = config.probability_levels if config else ["Faible", "Moyen", "Élevée"]

    try:
        impact_index = impact_levels.index(impact)
        index_prob = probability_levels.index(probabilite)
    except ValueError:
        # Implementation note.
        return "Moyen"

    # Normalize each index between 0 and 1
    normalized_impact = impact_index / (len(impact_levels) - 1) if len(impact_levels) > 1 else 0
    norm_prob = index_prob / (len(probability_levels) - 1) if len(probability_levels) > 1 else 0

    score = (normalized_impact + norm_prob) / 2  # entre 0 et 1

    if score <= 0.33:
        return "Faible"
    elif score <= 0.66:
        return "Moyen"
    else:
        return "Élevé"


@router.post("/", response_model=RiskOut)
def create_risque(
    data: RiskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == data.evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    organisation_id = get_organization_id_for_evaluation(evaluation, db)
    niveau = calculate_dynamic_risk_level(data.impact, data.probabilite, organisation_id, db)

    new_risk = Risk(
        evaluation_id=data.evaluation_id,
        titre=data.titre,
        description=data.description,
        categorie=data.categorie,
        impact=data.impact,
        probabilite=data.probabilite,
        risk_level=niveau,
    )
    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    from audit_logger import record_action
    record_action(db, current_user, "creation", "Risque", str(new_risk.id), f"Title:  {new_risk.titre}, Level:  {niveau}")

    return new_risk


@router.get("/", response_model=List[RiskOut])
def list_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Risk).all()


@router.get("/{risque_id}", response_model=RiskDetailOut)
def get_risk(
    risque_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risque = db.query(Risk).filter(Risk.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risque


@router.patch("/{risque_id}/statut", response_model=RiskOut)
def update_risk_status(
    risque_id: UUID,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    risque = db.query(Risk).filter(Risk.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risk not found")

    risque.statut = new_status
    db.commit()
    db.refresh(risque)
    return risque


@router.post("/{risque_id}/actions", response_model=CorrectiveActionOut)
def create_action_corrective(
    risque_id: UUID,
    data: CorrectiveActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    risque = db.query(Risk).filter(Risk.id == risque_id).first()
    if not risque:
        raise HTTPException(status_code=404, detail="Risk not found")

    new_action = CorrectiveAction(
        risque_id=risque_id,
        titre=data.titre,
        description=data.description,
        responsable_id=data.responsable_id,
        due_date=data.due_date,
    )
    db.add(new_action)
    db.commit()
    db.refresh(new_action)
    return new_action


@router.patch("/actions/{action_id}/statut", response_model=CorrectiveActionOut)
def update_action_status(
    action_id: UUID,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    from datetime import date

    action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Corrective action not found")

    action.statut = new_status
    if new_status == "Terminée":
        action.closure_date = date.today()

    db.commit()
    db.refresh(action)
    return action


@router.post("/generer-ia/{evaluation_id}")
def generate_risks_with_ai(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    from models.reponse import Response
    from models.clause import Clause
    from models.systeme_ia import AISystem
    from groq_service import generate_risks_and_actions

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if evaluation.evaluation_type == "Systeme_IA":
        systeme_ia = db.query(AISystem).filter(AISystem.id == evaluation.systeme_ia_id).first()
        context_name = systeme_ia.nom if systeme_ia else "AI system"
    else:
        context_name = "Gouvernance de l'organisation"

    reponses = db.query(Response).filter(
        Response.evaluation_id == evaluation_id,
        Response.reponse.in_(["Non conforme", "Partiellement conforme"])
    ).all()

    if not reponses:
        return {"message": "No non-compliance detected; no risks to generate.", "risques_crees": []}

    data_for_ai = []
    for r in reponses:
        clause = db.query(Clause).filter(Clause.id == r.clause_id).first()
        data_for_ai.append({
            "clause_titre": clause.titre if clause else "Inconnue",
            "clause_description": clause.description if clause else "",
            "reponse": r.reponse,
            "commentaire": r.commentaire,
        })

    suggested_risks = generate_risks_and_actions(context_name, data_for_ai)
    organisation_id = get_organization_id_for_evaluation(evaluation, db)

    created_risks = []
    for suggestion in suggested_risks:
        niveau = calculate_dynamic_risk_level(
            suggestion.get("impact", "Moyen"),
            suggestion.get("probabilite", "Moyen"),
            organisation_id,
            db
        )
        new_risk = Risk(
            evaluation_id=evaluation_id,
            titre=suggestion.get("titre", "Risk identified by AI"),
            description=suggestion.get("description", ""),
            categorie=suggestion.get("categorie", "General"),
            impact=suggestion.get("impact", "Moyen"),
            probabilite=suggestion.get("probabilite", "Moyen"),
            risk_level=niveau,
        )
        db.add(new_risk)
        db.commit()
        db.refresh(new_risk)

        action_data = suggestion.get("action_corrective", {})
        if action_data:
            new_action = CorrectiveAction(
                risque_id=new_risk.id,
                titre=action_data.get("titre", "Suggested corrective action"),
                description=action_data.get("description", ""),
            )
            db.add(new_action)
            db.commit()

        created_risks.append(new_risk)

    return {
        "message": f"{len(risques_crees)} risk(s) generated successfully by AI.",
        "risques_crees": [r.id for r in created_risks]
    }