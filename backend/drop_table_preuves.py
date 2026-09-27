from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS preuves"))
    conn.commit()

print("Table 'preuves' supprimée avec succès ✅")