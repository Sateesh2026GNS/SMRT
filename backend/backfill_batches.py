import sqlite3
from datetime import datetime, timezone

conn = sqlite3.connect('smrt.db')
curr = conn.cursor()

# Get all work orders
wos = curr.execute("SELECT id, tenant_id, work_order_number, planned_quantity, status, created_at FROM work_orders").fetchall()
print(f"Found {len(wos)} work orders.")

backfilled = 0
for wo_id, tenant_id, wo_num, qty, status, created_at in wos:
    # Check if a batch already exists
    exists = curr.execute("SELECT 1 FROM batches WHERE work_order_id = ?", (wo_id,)).fetchone()
    if not exists:
        clean_num = wo_num.replace("WO-", "")
        batch_code = f"BAT-{clean_num}"
        curr.execute(
            "INSERT INTO batches (tenant_id, work_order_id, batch_code, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (tenant_id, wo_id, batch_code, qty, status, created_at, created_at)
        )
        backfilled += 1

conn.commit()
conn.close()
print(f"Successfully backfilled {backfilled} batches.")
