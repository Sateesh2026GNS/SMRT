from datetime import date

from pydantic import BaseModel, ConfigDict


class IncomeBase(BaseModel):
    tenant_id: int
    category: str
    source: str | None = None
    amount: float
    income_date: date
    description: str | None = None


class IncomeCreate(IncomeBase):
    pass


class IncomeRead(IncomeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ExpenseBase(BaseModel):
    tenant_id: int
    category: str
    vendor: str | None = None
    amount: float
    expense_date: date
    description: str | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
