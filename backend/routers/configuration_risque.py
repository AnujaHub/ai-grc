from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.configuration_risque import ConfigurationRisque
from models.utilisateur import Utilisateur
from schemas.configuration_risque import ConfigurationRisqueOut, ConfigurationRisqueUpdate
from security import get_current_user
from uuid import UUID

router = APIRouter(prefix="/configuration-risque", tags=["Configuration Risque"])


@router.get("/{organisation_id}", response_model=ConfigurationRisqueOut)
def get_configuration(
    organisation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    config = db.query(ConfigurationRisque).filter(
        ConfigurationRisque.organisation_id == organisation_id
    ).first()

    if not config:
        # Crée une configuration par défaut (3 niveaux) si elle n'existe pas encore
        config = ConfigurationRisque(
            organisation_id=organisation_id,
            niveaux_impact=["Faible", "Moyen", "Élevé"],
            niveaux_probabilite=["Faible", "Moyen", "Élevée"],
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


@router.put("/{organisation_id}", response_model=ConfigurationRisqueOut)
def update_configuration(
    organisation_id: UUID,
    data: ConfigurationRisqueUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    if len(data.niveaux_impact) < 2 or len(data.niveaux_probabilite) < 2:
        raise HTTPException(status_code=400, detail="Il faut au moins 2 niveaux pour impact et probabilité")

    config = db.query(ConfigurationRisque).filter(
        ConfigurationRisque.organisation_id == organisation_id
    ).first()

    if not config:
        config = ConfigurationRisque(organisation_id=organisation_id)
        db.add(config)

    config.niveaux_impact = data.niveaux_impact
    config.niveaux_probabilite = data.niveaux_probabilite
    db.commit()
    db.refresh(config)
    return config