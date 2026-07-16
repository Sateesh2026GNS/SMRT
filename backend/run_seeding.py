from app.core.database import SessionLocal
from app.core.seed_dashboard import seed_dashboard_data

db = SessionLocal()
try:
    seed_dashboard_data(db)
    print("Dashboard seeding completed successfully.")
finally:
    db.close()
