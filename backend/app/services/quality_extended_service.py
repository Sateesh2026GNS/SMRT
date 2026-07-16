"""Quality extended — incoming, process, final QC, batch, defects, hub."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.quality import BatchQualityReport, Defect, QualityInspection
from app.schemas.quality_extended import (
    BatchReportRead,
    BatchReportSummaryRead,
    DefectEnrichedRead,
    DefectSummaryRead,
    FinalQCRead,
    FinalQCSummaryRead,
    IncomingInspectionRead,
    InspectionSummaryRead,
    ProcessQCRead,
    ProcessQCSummaryRead,
    QualityHubRead,
)


def _inspection_to_incoming(i: QualityInspection) -> IncomingInspectionRead:
    return IncomingInspectionRead(
        id=i.id,
        inspection_number=i.inspection_number,
        po_reference=i.po_reference,
        vendor_name=i.vendor_name,
        material_name=i.material_name,
        batch_code=i.batch_code,
        quantity=float(i.quantity or 0),
        inspector=i.inspector,
        result=i.result,
        status=i.status or i.result,
        inspection_date=i.inspection_date.isoformat() if i.inspection_date else None,
        inspection_time_minutes=float(i.inspection_time_minutes) if i.inspection_time_minutes else None,
        attachment=i.attachment,
    )


def _inspection_to_process(i: QualityInspection) -> ProcessQCRead:
    return ProcessQCRead(
        id=i.id,
        work_order_number=i.work_order_number,
        machine_name=i.machine_name,
        shift=i.shift,
        operator_name=i.operator_name,
        inspection_time=i.inspection_date.isoformat() if i.inspection_date else None,
        qc_status=i.status or i.result,
        remarks=i.notes,
        product_name=i.product_name,
        batch_code=i.batch_code,
    )


def _inspection_to_final(i: QualityInspection) -> FinalQCRead:
    return FinalQCRead(
        id=i.id,
        inspection_number=i.inspection_number,
        customer_name=i.customer_name,
        sales_order_number=i.sales_order_number,
        product_name=i.product_name,
        batch_code=i.batch_code,
        packing_status=i.packing_status,
        approval=i.approval,
        certificate_ref=i.certificate_ref,
        result=i.result,
        status=i.status or i.result,
        inspector=i.inspector,
        inspection_date=i.inspection_date.isoformat() if i.inspection_date else None,
    )


def get_incoming_summary(db: Session, tenant_id: int) -> InspectionSummaryRead:
    today = date.today()
    rows = list(
        db.scalars(
            select(QualityInspection).where(
                QualityInspection.tenant_id == tenant_id,
                QualityInspection.inspection_type == "incoming",
            )
        ).all()
    )
    today_count = sum(1 for r in rows if r.inspection_date == today)
    pending = sum(1 for r in rows if (r.status or r.result) in ("pending", "conditional"))
    passed = sum(1 for r in rows if r.result == "pass")
    failed = sum(1 for r in rows if r.result in ("fail", "failed"))
    rejected = sum(1 for r in rows if r.status == "rejected")
    times = [float(r.inspection_time_minutes) for r in rows if r.inspection_time_minutes]
    avg_time = sum(times) / len(times) if times else 0.0
    return InspectionSummaryRead(
        todays_inspections=today_count,
        pending_inspection=pending,
        passed=passed,
        failed=failed,
        rejected_lots=rejected,
        avg_inspection_time=round(avg_time, 1),
    )


def list_incoming_enriched(db: Session, tenant_id: int) -> list[IncomingInspectionRead]:
    rows = list(
        db.scalars(
            select(QualityInspection)
            .where(QualityInspection.tenant_id == tenant_id, QualityInspection.inspection_type == "incoming")
            .order_by(QualityInspection.inspection_date.desc())
        ).all()
    )
    return [_inspection_to_incoming(r) for r in rows]


def get_process_summary(db: Session, tenant_id: int) -> ProcessQCSummaryRead:
    rows = list(
        db.scalars(
            select(QualityInspection).where(
                QualityInspection.tenant_id == tenant_id,
                QualityInspection.inspection_type == "in_process",
            )
        ).all()
    )
    running_wo = int(db.scalar(select(func.count(QualityInspection.id)).where(QualityInspection.tenant_id == tenant_id, QualityInspection.inspection_type == "in_process", QualityInspection.result == "pass")) or 0)
    return ProcessQCSummaryRead(
        production_running=running_wo,
        qc_pending=sum(1 for r in rows if (r.status or r.result) == "pending"),
        passed=sum(1 for r in rows if r.result == "pass"),
        failed=sum(1 for r in rows if r.result in ("fail", "failed")),
        rework=sum(1 for r in rows if r.result == "rework"),
        scrap=sum(1 for r in rows if r.status == "scrap"),
    )


def list_process_enriched(db: Session, tenant_id: int) -> list[ProcessQCRead]:
    rows = list(
        db.scalars(
            select(QualityInspection)
            .where(QualityInspection.tenant_id == tenant_id, QualityInspection.inspection_type == "in_process")
            .order_by(QualityInspection.inspection_date.desc())
        ).all()
    )
    return [_inspection_to_process(r) for r in rows]


def get_final_summary(db: Session, tenant_id: int) -> FinalQCSummaryRead:
    rows = list(
        db.scalars(
            select(QualityInspection).where(
                QualityInspection.tenant_id == tenant_id,
                QualityInspection.inspection_type == "final",
            )
        ).all()
    )
    return FinalQCSummaryRead(
        pending_final=sum(1 for r in rows if (r.status or r.result) == "pending"),
        passed=sum(1 for r in rows if r.result == "pass"),
        failed=sum(1 for r in rows if r.result in ("fail", "failed")),
        packed=sum(1 for r in rows if r.packing_status == "packed"),
        ready_dispatch=sum(1 for r in rows if r.approval == "approved"),
    )


def list_final_enriched(db: Session, tenant_id: int) -> list[FinalQCRead]:
    rows = list(
        db.scalars(
            select(QualityInspection)
            .where(QualityInspection.tenant_id == tenant_id, QualityInspection.inspection_type == "final")
            .order_by(QualityInspection.inspection_date.desc())
        ).all()
    )
    return [_inspection_to_final(r) for r in rows]


def get_batch_summary(db: Session, tenant_id: int) -> BatchReportSummaryRead:
    reports = list(
        db.scalars(select(BatchQualityReport).where(BatchQualityReport.tenant_id == tenant_id)).all()
    )
    total_prod = sum(r.production_qty or (r.pass_count + r.fail_count) for r in reports)
    total_pass = sum(r.pass_count for r in reports)
    total_fail = sum(r.fail_count for r in reports)
    total_rework = sum(r.rework_qty for r in reports)
    total_reject = sum(r.reject_qty for r in reports)
    yield_pct = (total_pass / total_prod * 100) if total_prod else 0.0
    scrap_pct = (total_reject / total_prod * 100) if total_prod else 0.0
    rework_pct = (total_rework / total_prod * 100) if total_prod else 0.0
    return BatchReportSummaryRead(
        total_batches=len(reports),
        passed=total_pass,
        failed=total_fail,
        yield_pct=round(yield_pct, 1),
        scrap_pct=round(scrap_pct, 1),
        rework_pct=round(rework_pct, 1),
    )


def list_batch_enriched(db: Session, tenant_id: int) -> list[BatchReportRead]:
    reports = list(
        db.scalars(
            select(BatchQualityReport)
            .where(BatchQualityReport.tenant_id == tenant_id)
            .order_by(BatchQualityReport.report_date.desc())
        ).all()
    )
    result = []
    for r in reports:
        prod = r.production_qty or (r.pass_count + r.fail_count)
        yield_pct = (r.pass_count / prod * 100) if prod else 0
        result.append(
            BatchReportRead(
                id=r.id,
                batch_code=r.batch_code or f"BATCH-{r.batch_id}",
                product_name=r.product_name,
                shift=r.shift,
                production_qty=prod,
                pass_qty=r.pass_count,
                reject_qty=r.reject_qty or r.fail_count,
                yield_pct=round(yield_pct, 1),
                inspector=r.inspector,
                report_date=r.report_date.isoformat() if r.report_date else None,
            )
        )
    return result


def get_defect_summary(db: Session, tenant_id: int) -> DefectSummaryRead:
    defects = list(db.scalars(select(Defect).where(Defect.tenant_id == tenant_id)).all())
    return DefectSummaryRead(
        total_defects=len(defects),
        open=sum(1 for d in defects if d.status in ("open", "new")),
        in_progress=sum(1 for d in defects if d.status == "in_progress"),
        resolved=sum(1 for d in defects if d.status in ("resolved", "closed")),
        critical=sum(1 for d in defects if d.severity == "critical"),
        capa_pending=sum(1 for d in defects if d.corrective_action and d.status != "closed"),
    )


def list_defects_enriched(db: Session, tenant_id: int) -> list[DefectEnrichedRead]:
    defects = list(
        db.scalars(
            select(Defect).where(Defect.tenant_id == tenant_id).order_by(Defect.reported_at.desc())
        ).all()
    )
    return [
        DefectEnrichedRead(
            id=d.id,
            defect_code=d.defect_code,
            description=d.description,
            product_name=d.product_name,
            batch_code=d.batch_code,
            machine_name=d.machine_name,
            department=d.department,
            root_cause=d.root_cause,
            corrective_action=d.corrective_action,
            preventive_action=d.preventive_action,
            assigned_to=d.assigned_to,
            due_date=d.due_date.isoformat() if d.due_date else None,
            attachment=d.attachment,
            severity=d.severity,
            status=d.status,
            quantity_affected=d.quantity_affected,
            reported_at=d.reported_at.isoformat() if d.reported_at else None,
        )
        for d in defects
    ]


def get_quality_hub(db: Session, tenant_id: int) -> QualityHubRead:
    insp = list(db.scalars(select(QualityInspection).where(QualityInspection.tenant_id == tenant_id)).all())
    defects = list(db.scalars(select(Defect).where(Defect.tenant_id == tenant_id)).all())
    batch_sum = get_batch_summary(db, tenant_id)
    passed = sum(1 for i in insp if i.result == "pass")
    failed = sum(1 for i in insp if i.result in ("fail", "failed"))
    rejected = sum(1 for i in insp if i.status == "rejected")
    total = len(insp)
    defect_rate = (len(defects) / total * 100) if total else 0.0
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    pass_vs_fail = []
    if total > 0:
        pass_vs_fail = [{"name": "Pass", "count": passed}, {"name": "Fail", "count": failed}, {"name": "Pending", "count": total - passed - failed}]

    defect_by_month = {m: 0 for m in months}
    has_defects = False
    for d in defects:
        if d.reported_at:
            m_name = months[d.reported_at.month - 1]
            defect_by_month[m_name] += 1
            has_defects = True
    defect_trend = [{"month": m, "count": defect_by_month[m]} for m in months] if has_defects else []

    batches = list(db.scalars(select(BatchQualityReport).where(BatchQualityReport.tenant_id == tenant_id)).all())
    yield_by_month = {m: [] for m in months}
    has_yield = False
    for b in batches:
        if b.report_date:
            prod = b.production_qty or (b.pass_count + b.fail_count)
            if prod > 0:
                m_name = months[b.report_date.month - 1]
                yield_by_month[m_name].append(b.pass_count / prod * 100)
                has_yield = True
    monthly_yield = [
        {"month": m, "yield": round(sum(yield_by_month[m]) / len(yield_by_month[m]), 1) if yield_by_month[m] else 0.0}
        for m in months
    ] if has_yield else []

    supplier_quality = []
    
    mach_def_dict = {}
    for d in defects:
        if d.machine_name:
            mach_def_dict[d.machine_name] = mach_def_dict.get(d.machine_name, 0) + 1
    machine_defects = [{"name": name, "defects": count} for name, count in mach_def_dict.items()]

    defect_types = {}
    for d in defects:
        desc = d.description or "Other"
        defect_types[desc] = defect_types.get(desc, 0) + 1
    pareto_defects = [{"name": name, "count": count} for name, count in sorted(defect_types.items(), key=lambda x: x[1], reverse=True)]

    root_causes = {}
    for d in defects:
        if d.root_cause:
            root_causes[d.root_cause] = root_causes.get(d.root_cause, 0) + 1
    root_cause_analysis = [{"cause": cause, "count": count} for cause, count in root_causes.items()]

    prod_defs = {}
    for d in defects:
        if d.product_name:
            prod_defs[d.product_name] = prod_defs.get(d.product_name, 0) + 1
    defect_by_product = [{"name": name, "count": count} for name, count in prod_defs.items()]

    qc_perf = {}
    for i in insp:
        if i.inspector:
            if i.inspector not in qc_perf:
                qc_perf[i.inspector] = {"inspections": 0, "pass": 0}
            qc_perf[i.inspector]["inspections"] += 1
            if i.result == "pass":
                qc_perf[i.inspector]["pass"] += 1
    qc_performance = [
        {
            "inspector": name,
            "inspections": data["inspections"],
            "pass_rate": round(data["pass"] / data["inspections"] * 100, 1)
        }
        for name, data in qc_perf.items()
    ]

    alerts = []
    pending_count = sum(1 for i in insp if (i.status or i.result) == "pending")
    if pending_count > 0:
        alerts.append({"type": "pending", "message": f"{pending_count} inspections pending QC approval"})
    open_defects = sum(1 for d in defects if d.status in ("open", "new", "assigned", "in_progress"))
    if open_defects > 0:
        alerts.append({"type": "defect", "message": f"{open_defects} defects require CAPA closure"})

    return QualityHubRead(
        total_inspections=total,
        passed=passed,
        failed=failed,
        rejected=rejected,
        yield_pct=batch_sum.yield_pct,
        defect_rate=round(defect_rate, 1),
        pass_vs_fail=pass_vs_fail,
        defect_trend=defect_trend,
        monthly_yield=monthly_yield,
        supplier_quality=supplier_quality,
        machine_defects=machine_defects,
        pareto_defects=pareto_defects,
        root_cause_analysis=root_cause_analysis,
        defect_by_product=defect_by_product,
        qc_performance=qc_performance,
        recent_inspections=[
            {"number": i.inspection_number, "type": i.inspection_type, "result": i.result, "date": i.inspection_date.isoformat() if i.inspection_date else None}
            for i in insp[:5]
        ],
        alerts=alerts,
    )
