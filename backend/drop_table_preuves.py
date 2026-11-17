from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS evidence"))
    conn.commit()

print("Evidence table dropped successfully ✅")