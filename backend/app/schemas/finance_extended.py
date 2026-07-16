from pydantic import BaseModel


class APSummaryRead(BaseModel):
    outstanding_payables: float = 0
    due_this_week: int = 0
    overdue_bills: int = 0
    paid_this_month: float = 0
    pending_approvals: int = 0
    vendor_count: int = 0


class APListRead(BaseModel):
    id: int
    bill_number: str
    vendor_name: str
    po_reference: str | None = None
    invoice_no: str | None = None
    invoice_date: str | None = None
    due_date: str | None = None
    amount: float = 0
    gst: float = 0
    paid: float = 0
    balance: float = 0
    status: str = "pending"


class ARSummaryRead(BaseModel):
    total_receivables: float = 0
    received_today: float = 0
    overdue: float = 0
    pending_collection: float = 0
    credit_customers: int = 0
    aging_0_30: float = 0
    aging_31_60: float = 0
    aging_61_90: float = 0
    aging_90_plus: float = 0


class ARListRead(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    issue_date: str | None = None
    due_date: str | None = None
    amount: float = 0
    paid: float = 0
    balance: float = 0
    days_overdue: int = 0
    aging_bucket: str = "0-30"
    status: str = "pending"


class PaymentSummaryRead(BaseModel):
    cash_received_today: float = 0
    online_payments: float = 0
    cash_payments: float = 0
    bank_transfers: float = 0
    failed_payments: int = 0
    pending_payments: int = 0


class PaymentListRead(BaseModel):
    id: int
    payment_number: str
    invoice: str | None = None
    party_name: str | None = None
    party_type: str = "customer"
    payment_date: str | None = None
    amount: float = 0
    method: str = "cash"
    bank: str | None = None
    transaction_id: str | None = None
    utr_number: str | None = None
    payment_mode: str | None = None
    currency: str = "INR"
    status: str = "completed"
    attachment: str | None = None
    created_by: str | None = None


class GLSummaryRead(BaseModel):
    total_assets: float = 0
    total_liabilities: float = 0
    equity: float = 0
    revenue: float = 0
    expenses: float = 0
    cash_balance: float = 0


class GLListRead(BaseModel):
    id: int
    voucher_no: str
    entry_date: str | None = None
    account: str
    debit: float = 0
    credit: float = 0
    balance: float = 0
    narration: str | None = None
    cost_center: str | None = None
    branch: str | None = None


class GSTExtendedRead(BaseModel):
    year: int
    sgst: float = 0
    cgst: float = 0
    igst: float = 0
    total_gst: float = 0
    taxable_value: float = 0
    gst_payable: float = 0
    gst_receivable: float = 0
    monthly_collection: list[dict] = []
    gst_trend: list[dict] = []
    gst_by_customer: list[dict] = []
    gst_by_product: list[dict] = []


class PLExtendedRead(BaseModel):
    year: int
    revenue: float = 0
    gross_profit: float = 0
    net_profit: float = 0
    ebitda: float = 0
    operating_cost: float = 0
    manufacturing_cost: float = 0
    inventory_cost: float = 0
    monthly_revenue: list[dict] = []
    expense_trend: list[dict] = []
    profit_trend: list[dict] = []
    revenue_vs_expense: list[dict] = []
    department_cost: list[dict] = []
    factory_cost: list[dict] = []
    revenue_rows: list[dict] = []
    expense_rows: list[dict] = []
    total_revenue: float = 0
    total_expenses: float = 0
    profit: float = 0


class FinanceHubRead(BaseModel):
    total_receivables: float = 0
    outstanding_payables: float = 0
    cash_balance: float = 0
    monthly_revenue: float = 0
    monthly_expenses: float = 0
    net_profit: float = 0
    gst_payable: float = 0
    cash_flow_trend: list[dict] = []
    revenue_trend: list[dict] = []
    expense_trend: list[dict] = []
    profit_trend: list[dict] = []
    gst_trend: list[dict] = []
    vendor_payments: list[dict] = []
    customer_receipts: list[dict] = []
    monthly_cost: list[dict] = []
    department_cost: list[dict] = []
    manufacturing_cost: list[dict] = []
    budget_vs_actual: list[dict] = []
    accounts_aging: list[dict] = []
    alerts: list[dict] = []
