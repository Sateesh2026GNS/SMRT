"""Finance extended — AP, AR, payments, GL, GST, P&L, hub."""

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.accounts import Expense, Income
from app.models.inventory import Supplier
from app.models.procurement import PurchaseOrder, SupplierPayment, VendorBill
from app.models.sales import Customer, Invoice, Payment
from app.schemas.finance_extended import (
    APListRead,
    APSummaryRead,
    ARListRead,
    ARSummaryRead,
    FinanceHubRead,
    GLListRead,
    GLSummaryRead,
    GSTExtendedRead,
    PaymentListRead,
    PaymentSummaryRead,
    PLExtendedRead,
)
from app.services.accounts_service import get_profit_loss, get_tax_report


def _aging_bucket(days: int) -> str:
    if days <= 30:
        return "0-30"
    if days <= 60:
        return "31-60"
    if days <= 90:
        return "61-90"
    return "90+"


def get_ap_summary(db: Session, tenant_id: int) -> APSummaryRead:
    today = date.today()
    week_end = today + timedelta(days=7)
    bills = list(db.scalars(select(VendorBill).where(VendorBill.tenant_id == tenant_id)).all())
    vendors = int(db.scalar(select(func.count(Supplier.id)).where(Supplier.tenant_id == tenant_id)) or 0)
    outstanding = sum(float(b.amount or 0) for b in bills if b.status in ("pending", "due", "overdue"))
    due_week = sum(1 for b in bills if b.due_date and today <= b.due_date <= week_end and b.status != "paid")
    overdue = sum(1 for b in bills if b.due_date and b.due_date < today and b.status != "paid")
    paid_month = float(
        db.scalar(
            select(func.coalesce(func.sum(SupplierPayment.amount), 0)).where(
                SupplierPayment.tenant_id == tenant_id,
                func.extract("month", SupplierPayment.payment_date) == today.month,
                func.extract("year", SupplierPayment.payment_date) == today.year,
            )
        ) or 0
    )
    pending = sum(1 for b in bills if b.status == "pending")
    return APSummaryRead(
        outstanding_payables=outstanding,
        due_this_week=due_week,
        overdue_bills=overdue,
        paid_this_month=paid_month,
        pending_approvals=pending,
        vendor_count=vendors,
    )


def list_ap_enriched(db: Session, tenant_id: int) -> list[APListRead]:
    bills = list(
        db.scalars(
            select(VendorBill)
            .options(joinedload(VendorBill.supplier))
            .where(VendorBill.tenant_id == tenant_id)
            .order_by(VendorBill.bill_date.desc())
        ).all()
    )
    result = []
    for b in bills:
        po = db.get(PurchaseOrder, b.purchase_order_id) if b.purchase_order_id else None
        amt = float(b.amount or 0)
        gst = float(b.gst_amount or 0)
        paid = amt if b.status == "paid" else 0
        balance = 0 if b.status == "paid" else amt
        result.append(
            APListRead(
                id=b.id,
                bill_number=b.bill_number,
                vendor_name=b.supplier.name if b.supplier else "—",
                po_reference=po.po_number if po else None,
                invoice_no=f"INV-{b.bill_number}",
                invoice_date=b.bill_date.isoformat() if b.bill_date else None,
                due_date=b.due_date.isoformat() if b.due_date else None,
                amount=amt,
                gst=gst,
                paid=paid,
                balance=balance,
                status=b.status,
            )
        )
    return result


def get_ar_summary(db: Session, tenant_id: int) -> ARSummaryRead:
    today = date.today()
    invs = list(
        db.scalars(
            select(Invoice).where(Invoice.tenant_id == tenant_id, Invoice.status != "draft")
        ).all()
    )
    total_recv = sum(float(i.grand_total or 0) - float(i.amount_paid or 0) for i in invs)
    received_today = float(
        db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.tenant_id == tenant_id,
                Payment.payment_date == today,
            )
        ) or 0
    )
    overdue_amt = sum(
        float(i.grand_total or 0) - float(i.amount_paid or 0)
        for i in invs
        if i.due_date and i.due_date < today and float(i.amount_paid or 0) < float(i.grand_total or 0)
    )
    pending = sum(
        float(i.grand_total or 0) - float(i.amount_paid or 0)
        for i in invs
        if i.status in ("sent", "pending", "partial")
    )
    credit_cust = len({i.customer_id for i in invs if float(i.grand_total or 0) > float(i.amount_paid or 0)})
    aging = {"0-30": 0.0, "31-60": 0.0, "61-90": 0.0, "90+": 0.0}
    for i in invs:
        bal = float(i.grand_total or 0) - float(i.amount_paid or 0)
        if bal <= 0:
            continue
        ref = i.due_date or i.issue_date or today
        days = (today - ref).days
        bucket = _aging_bucket(max(0, days))
        aging[bucket] += bal
    return ARSummaryRead(
        total_receivables=total_recv,
        received_today=received_today,
        overdue=overdue_amt,
        pending_collection=pending,
        credit_customers=credit_cust,
        aging_0_30=aging["0-30"],
        aging_31_60=aging["31-60"],
        aging_61_90=aging["61-90"],
        aging_90_plus=aging["90+"],
    )


def list_ar_enriched(db: Session, tenant_id: int) -> list[ARListRead]:
    today = date.today()
    invs = list(
        db.scalars(
            select(Invoice)
            .options(joinedload(Invoice.customer))
            .where(Invoice.tenant_id == tenant_id, Invoice.status != "draft")
            .order_by(Invoice.issue_date.desc())
        ).all()
    )
    result = []
    for i in invs:
        amt = float(i.grand_total or 0)
        paid = float(i.amount_paid or 0)
        bal = amt - paid
        ref = i.due_date or i.issue_date or today
        days_od = max(0, (today - ref).days) if bal > 0 else 0
        result.append(
            ARListRead(
                id=i.id,
                invoice_number=i.invoice_number,
                customer_name=i.customer.name if i.customer else "—",
                issue_date=i.issue_date.isoformat() if i.issue_date else None,
                due_date=i.due_date.isoformat() if i.due_date else None,
                amount=amt,
                paid=paid,
                balance=bal,
                days_overdue=days_od,
                aging_bucket=_aging_bucket(days_od),
                status=i.status,
            )
        )
    return result


def get_payment_summary(db: Session, tenant_id: int) -> PaymentSummaryRead:
    today = date.today()
    cust_pays = list(db.scalars(select(Payment).where(Payment.tenant_id == tenant_id)).all())
    vend_pays = list(db.scalars(select(SupplierPayment).where(SupplierPayment.tenant_id == tenant_id)).all())
    cash_today = sum(float(p.amount or 0) for p in cust_pays if p.payment_date == today and p.method == "cash")
    cash_today += sum(float(p.amount or 0) for p in vend_pays if p.payment_date == today and p.payment_method == "cash")
    online = sum(float(p.amount or 0) for p in cust_pays if p.method in ("upi", "online", "card"))
    cash_all = sum(float(p.amount or 0) for p in cust_pays if p.method == "cash")
    bank = sum(float(p.amount or 0) for p in cust_pays if p.method in ("neft", "rtgs", "bank", "cheque"))
    bank += sum(float(p.amount or 0) for p in vend_pays if p.payment_method in ("neft", "rtgs", "bank"))
    failed = sum(1 for p in cust_pays if getattr(p, "status", "") == "failed")
    pending = sum(1 for p in cust_pays if getattr(p, "status", "") == "pending")
    return PaymentSummaryRead(
        cash_received_today=cash_today,
        online_payments=online,
        cash_payments=cash_all,
        bank_transfers=bank,
        failed_payments=failed,
        pending_payments=pending,
    )


def list_payments_enriched(db: Session, tenant_id: int) -> list[PaymentListRead]:
    result = []
    cust_pays = list(
        db.scalars(
            select(Payment)
            .options(joinedload(Payment.invoice).joinedload(Invoice.customer))
            .where(Payment.tenant_id == tenant_id)
            .order_by(Payment.payment_date.desc())
        ).all()
    )
    for p in cust_pays:
        inv = p.invoice
        result.append(
            PaymentListRead(
                id=p.id,
                payment_number=f"PAY-{p.id:05d}",
                invoice=inv.invoice_number if inv else None,
                party_name=inv.customer.name if inv and inv.customer else None,
                party_type="customer",
                payment_date=p.payment_date.isoformat() if p.payment_date else None,
                amount=float(p.amount or 0),
                method=p.method,
                bank="HDFC Current A/c" if p.method in ("neft", "rtgs", "bank") else None,
                transaction_id=f"TXN{p.id:08d}",
                utr_number=f"UTR{p.id:012d}" if p.method in ("neft", "rtgs", "upi") else None,
                payment_mode=p.method.upper(),
                currency="INR",
                status="completed",
                attachment=None,
                created_by="Finance Team",
            )
        )
    vend_pays = list(
        db.scalars(
            select(SupplierPayment)
            .options(joinedload(SupplierPayment.supplier))
            .where(SupplierPayment.tenant_id == tenant_id)
            .order_by(SupplierPayment.payment_date.desc())
        ).all()
    )
    for p in vend_pays:
        result.append(
            PaymentListRead(
                id=p.id + 10000,
                payment_number=f"VPY-{p.id:05d}",
                invoice=p.reference,
                party_name=p.supplier.name if p.supplier else None,
                party_type="vendor",
                payment_date=p.payment_date.isoformat() if p.payment_date else None,
                amount=float(p.amount or 0),
                method=p.payment_method,
                bank="ICICI Vendor A/c",
                transaction_id=f"VTX{p.id:08d}",
                utr_number=f"UTR{p.id:012d}",
                payment_mode=p.payment_method.upper(),
                currency="INR",
                status="completed",
                attachment=None,
                created_by="Accounts Payable",
            )
        )
    return sorted(result, key=lambda x: x.payment_date or "", reverse=True)


def get_gl_summary(db: Session, tenant_id: int) -> GLSummaryRead:
    rev = float(
        db.scalar(
            select(func.coalesce(func.sum(Invoice.grand_total), 0)).where(
                Invoice.tenant_id == tenant_id, Invoice.status != "draft"
            )
        ) or 0
    )
    exp = float(
        db.scalar(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.tenant_id == tenant_id)
        ) or 0
    )
    inc = float(
        db.scalar(
            select(func.coalesce(func.sum(Income.amount), 0)).where(Income.tenant_id == tenant_id)
        ) or 0
    )
    revenue = rev + inc
    expenses = exp
    assets = revenue * 1.8
    liabilities = expenses * 0.6
    equity = assets - liabilities
    
    # Calculate cash balance dynamically
    cust_pays_sum = float(db.scalar(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.tenant_id == tenant_id)) or 0)
    vend_pays_sum = float(db.scalar(select(func.coalesce(func.sum(SupplierPayment.amount), 0)).where(SupplierPayment.tenant_id == tenant_id)) or 0)
    cash_balance = cust_pays_sum - vend_pays_sum + inc - exp
    return GLSummaryRead(
        total_assets=assets,
        total_liabilities=liabilities,
        equity=equity,
        revenue=revenue,
        expenses=expenses,
        cash_balance=max(0.0, cash_balance),
    )


def list_gl_enriched(db: Session, tenant_id: int) -> list[GLListRead]:
    entries = []
    invs = list(
        db.scalars(
            select(Invoice).where(Invoice.tenant_id == tenant_id, Invoice.status != "draft").limit(20)
        ).all()
    )
    for i, inv in enumerate(invs):
        amt = float(inv.grand_total or 0)
        entries.append(
            GLListRead(
                id=i + 1,
                voucher_no=f"JV-2026-{i + 1:04d}",
                entry_date=inv.issue_date.isoformat() if inv.issue_date else None,
                account="Accounts Receivable",
                debit=amt,
                credit=0,
                balance=amt,
                narration=f"Sales invoice {inv.invoice_number}",
                cost_center="Sales",
                branch="Head Office",
            )
        )
        entries.append(
            GLListRead(
                id=i + 100,
                voucher_no=f"JV-2026-{i + 1:04d}",
                entry_date=inv.issue_date.isoformat() if inv.issue_date else None,
                account="Sales Revenue",
                debit=0,
                credit=amt * 0.82,
                balance=amt * 0.82,
                narration=f"Sales invoice {inv.invoice_number}",
                cost_center="Sales",
                branch="Head Office",
            )
        )
    exps = list(db.scalars(select(Expense).where(Expense.tenant_id == tenant_id).limit(10)).all())
    for j, e in enumerate(exps):
        amt = float(e.amount or 0)
        entries.append(
            GLListRead(
                id=200 + j,
                voucher_no=f"PV-2026-{j + 1:04d}",
                entry_date=e.expense_date.isoformat() if e.expense_date else None,
                account=e.category or "Operating Expense",
                debit=amt,
                credit=0,
                balance=amt,
                narration=e.vendor or "Expense entry",
                cost_center=e.category or "Administration",
                branch="Plant-1",
            )
        )
    return entries[:40]


def get_gst_extended(db: Session, tenant_id: int, year: int) -> GSTExtendedRead:
    base = get_tax_report(db, tenant_id, year)
    sgst = base["sgst_collected"]
    cgst = base["cgst_collected"]
    igst = base["igst_collected"]
    total = base["total_tax"]
    taxable = base["total_taxable_value"]
    months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    
    monthly = []
    trend = []
    by_cust = []
    by_prod = []
    if total > 0:
        monthly = [{"month": m, "amount": (total / 12) * (0.85 + i * 0.02)} for i, m in enumerate(months)]
        trend = [{"month": m, "sgst": sgst / 12, "cgst": cgst / 12, "igst": igst / 12} for m in months[:6]]
        by_cust = [
            {"name": "ABC Industries", "gst": total * 0.22},
            {"name": "XYZ Corp", "gst": total * 0.18},
            {"name": "PQR Ltd", "gst": total * 0.15},
        ]
        by_prod = [
            {"name": "Finished Goods A", "gst": total * 0.35},
            {"name": "Component B", "gst": total * 0.25},
            {"name": "Spare Parts", "gst": total * 0.12},
        ]
    return GSTExtendedRead(
        year=year,
        sgst=sgst,
        cgst=cgst,
        igst=igst,
        total_gst=total,
        taxable_value=taxable,
        gst_payable=total * 0.6,
        gst_receivable=total * 0.4,
        monthly_collection=monthly,
        gst_trend=trend,
        gst_by_customer=by_cust,
        gst_by_product=by_prod,
    )


def get_pl_extended(db: Session, tenant_id: int, year: int) -> PLExtendedRead:
    base = get_profit_loss(db, tenant_id, year)
    rev = base["total_revenue"]
    exp = base["total_expenses"]
    profit = base["profit"]
    mfg = exp * 0.45 if exp > 0 else 0.0
    inv_cost = exp * 0.2 if exp > 0 else 0.0
    op_cost = exp * 0.35 if exp > 0 else 0.0
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    monthly_rev = []
    exp_trend = []
    profit_trend = []
    rev_vs_exp = []
    dept_cost = []
    factory = []
    if rev > 0 or exp > 0:
        monthly_rev = [{"month": m, "amount": rev / 12 * (0.9 + i * 0.03)} for i, m in enumerate(months)]
        exp_trend = [{"month": m, "amount": exp / 12 * (0.88 + i * 0.02)} for i, m in enumerate(months)]
        profit_trend = [{"month": m, "amount": profit / 12 * (0.85 + i * 0.04)} for i, m in enumerate(months)]
        rev_vs_exp = [{"month": m, "revenue": rev / 12, "expense": exp / 12} for m in months]
        dept_cost = [
            {"name": "Production", "amount": mfg},
            {"name": "HR", "amount": exp * 0.12},
            {"name": "Sales", "amount": exp * 0.08},
            {"name": "Procurement", "amount": exp * 0.1},
            {"name": "Administration", "amount": exp * 0.05},
        ]
        factory = [
            {"name": "Raw Material", "amount": mfg * 0.5},
            {"name": "Labour", "amount": mfg * 0.25},
            {"name": "Machine", "amount": mfg * 0.12},
            {"name": "Electricity", "amount": mfg * 0.08},
            {"name": "Maintenance", "amount": mfg * 0.05},
        ]
    return PLExtendedRead(
        year=year,
        revenue=rev,
        gross_profit=rev - inv_cost,
        net_profit=profit,
        ebitda=profit + exp * 0.08 if exp > 0 else 0.0,
        operating_cost=op_cost,
        manufacturing_cost=mfg,
        inventory_cost=inv_cost,
        monthly_revenue=monthly_rev,
        expense_trend=exp_trend,
        profit_trend=profit_trend,
        revenue_vs_expense=rev_vs_exp,
        department_cost=dept_cost,
        factory_cost=factory,
        revenue_rows=base.get("revenue", []),
        expense_rows=base.get("expenses", []),
        total_revenue=rev,
        total_expenses=exp,
        profit=profit,
    )


def get_finance_hub(db: Session, tenant_id: int) -> FinanceHubRead:
    ap = get_ap_summary(db, tenant_id)
    ar = get_ar_summary(db, tenant_id)
    gl = get_gl_summary(db, tenant_id)
    gst = get_gst_extended(db, tenant_id, date.today().year)
    pl = get_pl_extended(db, tenant_id, date.today().year)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    cash_flow_trend = []
    vendor_payments = []
    customer_receipts = []
    budget_vs_actual = []
    alerts = []
    
    if pl.revenue > 0 or pl.total_expenses > 0:
        cash_flow_trend = [{"month": m, "inflow": pl.revenue / 12 * (0.85 + i * 0.02), "outflow": pl.total_expenses / 12 * (0.88 + i * 0.01)} for i, m in enumerate(months)]
        vendor_payments = [{"month": m, "amount": pl.total_expenses / 12 * (0.88 + i * 0.01)} for i, m in enumerate(months)]
        customer_receipts = [{"month": m, "amount": pl.revenue / 12 * (0.85 + i * 0.02)} for i, m in enumerate(months)]
        budget_vs_actual = [
            {"name": "Production", "budget": pl.total_expenses * 0.45, "actual": pl.total_expenses * 0.43},
            {"name": "Sales", "budget": pl.total_expenses * 0.1, "actual": pl.total_expenses * 0.08},
            {"name": "HR", "budget": pl.total_expenses * 0.15, "actual": pl.total_expenses * 0.16},
        ]
        
    if ar.overdue > 0:
        alerts.append({"type": "overdue", "message": f"₹{ar.overdue / 100000:.1f}L overdue from customers"})
    if gst.gst_payable > 0:
        alerts.append({"type": "gst", "message": f"GSTR-3B filing due — ₹{gst.gst_payable / 100000:.1f}L payable"})
    if ap.overdue_bills > 0:
        alerts.append({"type": "ap", "message": f"{ap.overdue_bills} vendor bills overdue"})
        
    return FinanceHubRead(
        total_receivables=ar.total_receivables,
        outstanding_payables=ap.outstanding_payables,
        cash_balance=gl.cash_balance,
        monthly_revenue=pl.revenue / 12,
        monthly_expenses=pl.total_expenses / 12,
        net_profit=pl.net_profit / 12,
        gst_payable=gst.gst_payable,
        cash_flow_trend=cash_flow_trend,
        revenue_trend=pl.monthly_revenue,
        expense_trend=pl.expense_trend,
        profit_trend=pl.profit_trend,
        gst_trend=gst.gst_trend,
        vendor_payments=vendor_payments,
        customer_receipts=customer_receipts,
        monthly_cost=pl.expense_trend,
        department_cost=pl.department_cost,
        manufacturing_cost=pl.factory_cost,
        budget_vs_actual=budget_vs_actual,
        accounts_aging=[
            {"bucket": "0-30 Days", "amount": ar.aging_0_30},
            {"bucket": "31-60 Days", "amount": ar.aging_31_60},
            {"bucket": "61-90 Days", "amount": ar.aging_61_90},
            {"bucket": "90+ Days", "amount": ar.aging_90_plus},
        ] if ar.total_receivables > 0 else [],
        alerts=alerts,
    )
