from database import Base, engine
from models.organisation import Organization
from models.utilisateur import User
from models.systeme_ia import AISystem
from models.referentiel import ReferenceFramework
from models.chapitre import Chapter
from models.clause import Clause
from models.evaluation import Evaluation
from models.reponse import Response
from models.risque import Risk
from models.action_corrective import CorrectiveAction
from models.preuve import Evidence
from models.configuration_risque import RiskConfiguration

print("Dropping tables...")
Base.metadata.drop_all(bind=engine)
print("Tables dropped successfully ✅")