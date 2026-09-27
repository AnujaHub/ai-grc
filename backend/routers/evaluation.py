from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.evaluation import Evaluation
from models.reponse import Reponse
from models.clause import Clause
from models.chapitre import Chapitre
from models.utilisateur import Utilisateur
from schemas.evaluation import EvaluationCreate, EvaluationOut, EvaluationDetailOut, ReponseCreate, ReponseOut
from security import get_current_user
from typing import List
from uuid import UUID
from datetime import date
from security import require_roles

router = APIRouter(prefix="/evaluations", tags=["Évaluations"])

SCORE_PAR_REPONSE = {
    "Conforme": 100,
    "Partiellement conforme": 50,
    "Non conforme": 0,
    "Non applicable": None,
}


@router.post("/", response_model=EvaluationOut)
def create_evaluation(
    data: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur", "responsable_conformite"))
):
    if data.type_evaluation == "Systeme_IA" and not data.systeme_ia_id:
        raise HTTPException(status_code=400, detail="systeme_ia_id est requis pour une évaluation de type Systeme_IA")
    if data.type_evaluation == "Organisation" and not data.organisation_id:
        raise HTTPException(status_code=400, detail="organisation_id est requis pour une évaluation de type Organisation")

    nouvelle_eval = Evaluation(
        type_evaluation=data.type_evaluation,
        systeme_ia_id=data.systeme_ia_id,
        organisation_id=data.organisation_id,
        referentiel_id=data.referentiel_id,
        responsable_id=current_user.id,
        date_debut=date.today(),
        statut="En cours"
    )
    db.add(nouvelle_eval)
    db.commit()
    db.refresh(nouvelle_eval)

    from audit_logger import enregistrer_action
    enregistrer_action(db, current_user, "creation", "Evaluation", str(nouvelle_eval.id))

    return nouvelle_eval


@router.get("/", response_model=List[EvaluationOut])
def list_evaluations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Evaluation).all()


@router.get("/{evaluation_id}", response_model=EvaluationDetailOut)
def get_evaluation(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")
    return evaluation


@router.post("/{evaluation_id}/reponses", response_model=ReponseOut)
def repondre_a_une_clause(
    evaluation_id: UUID,
    data: ReponseCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    reponse_existante = db.query(Reponse).filter(
        Reponse.evaluation_id == evaluation_id,
        Reponse.clause_id == data.clause_id
    ).first()

    if reponse_existante:
        reponse_existante.reponse = data.reponse
        reponse_existante.commentaire = data.commentaire
        reponse_existante.repondant_id = current_user.id
        db.commit()
        db.refresh(reponse_existante)
        return reponse_existante
    else:
        nouvelle_reponse = Reponse(
            evaluation_id=evaluation_id,
            clause_id=data.clause_id,
            reponse=data.reponse,
            commentaire=data.commentaire,
            repondant_id=current_user.id,
        )
        db.add(nouvelle_reponse)
        db.commit()
        db.refresh(nouvelle_reponse)
        return nouvelle_reponse


@router.post("/{evaluation_id}/finaliser", response_model=EvaluationOut)
def finaliser_evaluation(
    evaluation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur", "responsable_conformite"))
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")

    reponses = db.query(Reponse).filter(Reponse.evaluation_id == evaluation_id).all()

    scores_valides = []
    for r in reponses:
        valeur = SCORE_PAR_REPONSE.get(r.reponse)
        if valeur is not None:
            scores_valides.append(valeur)

    score_final = sum(scores_valides) / len(scores_valides) if scores_valides else 0

    evaluation.score = round(score_final, 2)
    evaluation.statut = "Terminée"
    evaluation.date_fin = date.today()

    db.commit()
    db.refresh(evaluation)

    from audit_logger import enregistrer_action
    enregistrer_action(db, current_user, "finalisation", "Evaluation", str(evaluation.id), f"Score : {evaluation.score}%")

    return evaluation