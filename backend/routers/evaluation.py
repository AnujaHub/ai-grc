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
    if data.evaluation_type == "Systeme_IA" and not data.ai_system_id:
        raise HTTPException(status_code=400, detail="ai_system_id is required for a Systeme_IA assessment")
    if data.evaluation_type == "Organisation" and not data.organization_id:
        raise HTTPException(status_code=400, detail="organization_id is required for an Organisation assessment")

    new_evaluation = Evaluation(
        evaluation_type=data.evaluation_type,
        ai_system_id=data.ai_system_id,
        organization_id=data.organization_id,
        framework_id=data.framework_id,
        responsible_id=current_user.id,
        start_date=date.today(),
        status="En cours"
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


@router.post("/{evaluation_id}/responses", response_model=ResponseOut)
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
        existing_response.response = data.response
        existing_response.comment = data.comment
        existing_response.respondent_id = current_user.id
        db.commit()
        db.refresh(existing_response)
        return existing_response
    else:
        new_response = Response(
            evaluation_id=evaluation_id,
            clause_id=data.clause_id,
            response=data.response,
            comment=data.comment,
            respondent_id=current_user.id,
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

    responses = db.query(Response).filter(Response.evaluation_id == evaluation_id).all()

    valid_scores = []
    for r in responses:
        valeur = SCORE_BY_RESPONSE.get(r.response)
        if valeur is not None:
            valid_scores.append(valeur)

    final_score = sum(valid_scores) / len(valid_scores) if valid_scores else 0

    evaluation.score = round(final_score, 2)
    evaluation.status = "Terminée"
    evaluation.end_date = date.today()

    db.commit()
    db.refresh(evaluation)

    from audit_logger import record_action
    record_action(db, current_user, "finalisation", "Evaluation", str(evaluation.id), f"Score : {evaluation.score}%")

    return evaluation