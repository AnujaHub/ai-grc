from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.configuration_risque import RiskConfiguration
from models.utilisateur import User
from schemas.configuration_risque import RiskConfigurationOut, RiskConfigurationUpdate
from security import get_current_user
from uuid import UUID

router = APIRouter(prefix="/configuration-risque", tags=["Risk Configuration"])


@router.get("/{organisation_id}", response_model=RiskConfigurationOut)
def get_configuration(
    organisation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    config = db.query(RiskConfiguration).filter(
        RiskConfiguration.organisation_id == organisation_id
    ).first()

    if not config:
        # Implementation note.
        config = RiskConfiguration(
            organisation_id=organisation_id,
            impact_levels=["Faible", "Moyen", "Élevé"],
            probability_levels=["Faible", "Moyen", "Élevée"],
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


@router.put("/{organisation_id}", response_model=RiskConfigurationOut)
def update_configuration(
    organisation_id: UUID,
    data: RiskConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(data.impact_levels) < 2 or len(data.probability_levels) < 2:
        raise HTTPException(status_code=400, detail="At least 2 impact and probability levels are required")

    config = db.query(RiskConfiguration).filter(
        RiskConfiguration.organisation_id == organisation_id
    ).first()

    if not config:
        config = RiskConfiguration(organisation_id=organisation_id)
        db.add(config)

    config.impact_levels = data.impact_levels
    config.probability_levels = data.probability_levels
    db.commit()
    db.refresh(config)
    return config