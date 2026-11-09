from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.evaluation import Evaluation
from models.reponse import Response
from models.clause import Clause
from models.chapitre import Chapter
from models.utilisateur import User
from schemas.evaluation import EvaluationCreate, EvaluationOut, EvaluationDetailOut, ResponseCreate, ResponseOut
from security import get_current_user
from typing import List
from uuid import UUID
from datetime import date
from security import require_roles

router = APIRouter(prefix="/evaluations", tags=["Assessments"])

SCORE_BY_RESPONSE = {
    "Conforme": 100,
    "Partiellement conforme": 50,
    "Non conforme": 0,
    "Non applicable": None,
}


@router.post("/", response_model=EvaluationOut)
def create_evaluation(
    data: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    if data.evaluation_type == "Systeme_IA" and not data.systeme_ia_id:
        raise HTTPException(status_code=400, detail="systeme_ia_id is required for a Systeme_IA assessment")
    if data.evaluation_type == "Organisation" and not data.organisation_id:
        raise HTTPException(status_code=400, detail="organisation_id is required for an Organisation assessment")

    new_evaluation = Evaluation(
        evaluation_type=data.evaluation_type,
        systeme_ia_id=data.systeme_ia_id,
        organisation_id=data.organisation_id,
        referentiel_id=data.referentiel_id,
        responsable_id=current_user.id,
        start_date=date.today(),
        statut="En cours"
    )
    db.add(new_evaluation)
    db.commit()
    db.refresh(new_evaluation)

    from audit_logger import record_action
    record_action(db, current_user, "creation", "Evaluation", str(new_evaluation.id))

    return new_evaluation


@router.get("/", response_model=List[EvaluationOut])
def list_evaluations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Evaluation).all()


@router.get("/{evaluation_id}", response_model=EvaluationDetailOut)
def get_evaluation(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return evaluation


@router.post("/{evaluation_id}/reponses", response_model=ResponseOut)
def answer_clause(
    evaluation_id: UUID,
    data: ResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    existing_response = db.query(Response).filter(
        Response.evaluation_id == evaluation_id,
        Response.clause_id == data.clause_id
    ).first()

    if existing_response:
        existing_response.reponse = data.reponse
        existing_response.commentaire = data.commentaire
        existing_response.repondant_id = current_user.id
        db.commit()
        db.refresh(existing_response)
        return existing_response
    else:
        new_response = Response(
            evaluation_id=evaluation_id,
            clause_id=data.clause_id,
            reponse=data.reponse,
            commentaire=data.commentaire,
            repondant_id=current_user.id,
        )
        db.add(new_response)
        db.commit()
        db.refresh(new_response)
        return new_response


@router.post("/{evaluation_id}/finaliser", response_model=EvaluationOut)
def finaliser_evaluation(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Assessment not found")

    reponses = db.query(Response).filter(Response.evaluation_id == evaluation_id).all()

    valid_scores = []
    for r in reponses:
        valeur = SCORE_BY_RESPONSE.get(r.reponse)
        if valeur is not None:
            valid_scores.append(valeur)

    final_score = sum(valid_scores) / len(valid_scores) if valid_scores else 0

    evaluation.score = round(final_score, 2)
    evaluation.statut = "Terminée"
    evaluation.end_date = date.today()

    db.commit()
    db.refresh(evaluation)

    from audit_logger import record_action
    record_action(db, current_user, "finalisation", "Evaluation", str(evaluation.id), f"Score : {evaluation.score}%")

    return evaluation