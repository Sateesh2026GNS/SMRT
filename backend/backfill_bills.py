import sqlite3
from datetime import date, timedelta

conn = sqlite3.connect('smrt.db')
curr = conn.cursor()

# Get all goods receipts
grs = curr.execute("SELECT id, tenant_id, purchase_order_id, grn_number, receipt_date, created_at FROM goods_receipts").fetchall()
print(f"Found {len(grs)} goods receipts.")

bill_count = 0

for gr_id, tenant_id, po_id, grn_num, receipt_date, created_at in grs:
    # Check if a vendor bill already exists for this GRN
    exists = curr.execute("SELECT 1 FROM vendor_bills WHERE goods_receipt_id = ?", (gr_id,)).fetchone()
    if not exists:
        # Get supplier_id and total_amount from purchase order
        po = None
        if po_id:
            po = curr.execute("SELECT supplier_id, total_amount, gst_amount FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
        
        if po:
            supplier_id, total_amount, gst_amount = po
        else:
            supplier_id = 1
            total_amount = 5000.0
            gst_amount = 900.0
            
        bill_num = grn_num.replace("GRN", "BILL")
        due_date = (date.today() + timedelta(days=30)).isoformat()
        
        curr.execute(
            "INSERT INTO vendor_bills (tenant_id, bill_number, supplier_id, purchase_order_id, goods_receipt_id, bill_date, due_date, amount, gst_amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (tenant_id, bill_num, supplier_id, po_id, gr_id, receipt_date, due_date, total_amount or 5000.0, gst_amount or 900.0, 'pending', created_at, created_at)
        )
        bill_count += 1

conn.commit()
conn.close()
print(f"Successfully backfilled {bill_count} vendor bills.")
