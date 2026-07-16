"""Quick SQLite integrity and table check."""
import os
import sqlite3
import sys

path = os.environ.get("SQLITE_PATH", "smrt.db")
if not os.path.exists(path):
    print(f"{path}: not found (created on first server start)")
    sys.exit(0)

con = sqlite3.connect(path)
ok = con.execute("PRAGMA integrity_check").fetchone()[0]
tables = [
    r[0]
    for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1"
    ).fetchall()
]
print("integrity:", ok)
print("tables:", len(tables))
for t in [
    "erp_notifications",
    "company_settings",
    "bill_of_materials",
    "access_logs",
    "documents",
    "tasks",
]:
    print(f"  {t}:", t in tables)
con.close()
sys.exit(0 if ok == "ok" else 1)
