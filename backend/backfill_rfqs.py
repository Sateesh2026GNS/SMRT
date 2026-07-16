import sqlite3
import random
from datetime import date, timedelta

conn = sqlite3.connect('smrt.db')
curr = conn.cursor()

# Get all material requests
mrs = curr.execute("SELECT id, tenant_id, mr_number, created_at FROM material_requests").fetchall()
print(f"Found {len(mrs)} material requests.")

# Get all suppliers
suppliers = curr.execute("SELECT id FROM suppliers").fetchall()
supplier_ids = [s[0] for s in suppliers]
print(f"Found {len(supplier_ids)} suppliers.")

rfq_count = 0
quote_count = 0

for mr_id, tenant_id, mr_num, created_at in mrs:
    # Check if RFQ already exists
    exists = curr.execute("SELECT 1 FROM rfqs WHERE material_request_id = ?", (mr_id,)).fetchone()
    if not exists:
        rfq_num = mr_num.replace("MR", "RFQ")
        due_date = (date.today() + timedelta(days=7)).isoformat()
        
        # Insert RFQ
        curr.execute(
            "INSERT INTO rfqs (tenant_id, rfq_number, material_request_id, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (tenant_id, rfq_num, mr_id, due_date, 'open', created_at, created_at)
        )
        rfq_id = curr.lastrowid
        rfq_count += 1
        
        # Insert Vendor Quotations
        for i, s_id in enumerate(supplier_ids[:3]):
            price = float(random.choice([12000, 14000, 15000, 18000]))
            delivery = random.choice([3, 5, 7])
            rating = random.choice([4.2, 4.5, 4.8])
            status = 'submitted'
            warranty = "1 Year"
            gst_pct = 18.0
            
            curr.execute(
                "INSERT INTO vendor_quotations (tenant_id, rfq_id, supplier_id, price, delivery_days, gst_pct, warranty, rating, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (tenant_id, rfq_id, s_id, price, delivery, gst_pct, warranty, rating, status, created_at, created_at)
            )
            quote_count += 1

conn.commit()
conn.close()
print(f"Successfully backfilled {rfq_count} RFQs and {quote_count} Vendor Quotations.")
