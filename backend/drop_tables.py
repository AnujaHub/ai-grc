from database import Base, engine
from models.organisation import Organisation
from models.utilisateur import Utilisateur
from models.systeme_ia import SystemeIA
from models.referentiel import Referentiel
from models.chapitre import Chapitre
from models.clause import Clause
from models.evaluation import Evaluation
from models.reponse import Reponse
from models.risque import Risque
from models.action_corrective import ActionCorrective
from models.preuve import Preuve
from models.configuration_risque import ConfigurationRisque

print("Suppression des tables...")
Base.metadata.drop_all(bind=engine)
print("Tables supprimées avec succès ✅")