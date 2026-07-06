from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.hr import (
    AttendanceRecordCreate,
    AttendanceRecordRead,
    EmployeeCreate,
    EmployeeRead,
    LeaveRequestCreate,
    LeaveRequestCreateIn,
    LeaveRequestRead,
    LeaveRequestUpdate,
    PayrollRecordCreate,
    PayrollRecordRead,
    PerformanceReviewCreate,
    PerformanceReviewRead,
    ShiftCreate,
    ShiftRead,
)
from app.services.hr_service import (
    create_attendance_record,
    create_employee,
    create_leave_request,
    create_payroll_record,
    create_performance_review,
    create_shift,
    get_hr_dashboard,
    list_attendance,
    list_employees,
    list_leave_requests,
    list_payroll,
    list_performance_reviews,
    list_shifts,
    record_clock_in,
    record_clock_out,
    update_leave_request,
)

router = APIRouter(prefix="/hr", tags=["hr"])

MODULE = "hr"


@router.get("/dashboard")
def hr_dashboard(tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)):
    return get_hr_dashboard(db, tenant_id)


@router.post("/employees", response_model=EmployeeRead)
def create_employee_endpoint(
    payload: EmployeeCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_employee(db, payload)


@router.get("/employees", response_model=list[EmployeeRead])
def list_employees_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_employees(db, tenant_id)


@router.post("/shifts", response_model=ShiftRead)
def create_shift_endpoint(
    payload: ShiftCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_shift(db, payload)


@router.get("/shifts", response_model=list[ShiftRead])
def list_shifts_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_shifts(db, tenant_id)


@router.post("/attendance", response_model=AttendanceRecordRead)
def create_attendance_endpoint(
    payload: AttendanceRecordCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_attendance_record(db, payload)


@router.post("/attendance/clock-in", response_model=AttendanceRecordRead)
def clock_in_endpoint(
    employee_id: int = Query(...),
    record_date: date = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    return record_clock_in(db, tenant_id, employee_id, record_date)


@router.post("/attendance/clock-out")
def clock_out_endpoint(
    employee_id: int = Query(...),
    record_date: date = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    rec = record_clock_out(db, tenant_id, employee_id, record_date)
    if not rec:
        raise HTTPException(404, "No open attendance record to clock out")
    return {"success": True, "record": AttendanceRecordRead.model_validate(rec)}


@router.get("/attendance", response_model=list[AttendanceRecordRead])
def list_attendance_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    employee_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_attendance(db, tenant_id, date_from, date_to, employee_id)


@router.post("/payroll", response_model=PayrollRecordRead)
def create_payroll_endpoint(
    payload: PayrollRecordCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_payroll_record(db, payload)


@router.get("/payroll", response_model=list[PayrollRecordRead])
def list_payroll_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    employee_id: int | None = Query(None),
    period_start: date | None = Query(None),
    period_end: date | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_payroll(db, tenant_id, employee_id, period_start, period_end)


@router.post("/performance", response_model=PerformanceReviewRead)
def create_performance_endpoint(
    payload: PerformanceReviewCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_performance_review(db, payload)


@router.get("/performance", response_model=list[PerformanceReviewRead])
def list_performance_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    employee_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_performance_reviews(db, tenant_id, employee_id)


@router.post("/leave", response_model=LeaveRequestRead)
def create_leave_endpoint(
    payload: LeaveRequestCreateIn,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    try:
        return create_leave_request(
            db,
            LeaveRequestCreate(tenant_id=user.tenant_id, **payload.model_dump()),
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.get("/leave", response_model=list[LeaveRequestRead])
def list_leave_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    employee_id: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_leave_requests(db, tenant_id, employee_id, status)


@router.patch("/leave/{leave_id}", response_model=LeaveRequestRead)
def update_leave_endpoint(
    leave_id: int,
    payload: LeaveRequestUpdate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    leave = update_leave_request(db, user.tenant_id, leave_id, payload)
    if not leave:
        raise HTTPException(404, "Leave request not found")
    return leave
