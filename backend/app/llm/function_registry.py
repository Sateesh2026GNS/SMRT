"""Function-calling tool definitions mapped to Operator API service layer."""

from __future__ import annotations

import logging
from datetime import date
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.operator import (
    BatchUpdateRequest,
    MachineBreakdownRequest,
    ShopFloorUpdateRequest,
    WorkOrderActionRequest,
    WorkOrderProgressRequest,
)
from app.services.operator_service import OperatorService

logger = logging.getLogger(__name__)

TOOL_DEFINITIONS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "get_todays_work_orders",
            "description": "Get work orders scheduled or active for today.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pending_work_orders",
            "description": "List pending work orders.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_assigned_work_orders",
            "description": "Get work orders assigned to the current operator.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_work_order_by_number",
            "description": "Get work order details by number e.g. WO-101.",
            "parameters": {
                "type": "object",
                "properties": {"work_order_number": {"type": "string"}},
                "required": ["work_order_number"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_todays_production",
            "description": "Get today's production target and completed quantity.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_machine_status",
            "description": "Get machine status by code or all machines.",
            "parameters": {
                "type": "object",
                "properties": {"machine_code": {"type": "string"}},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_running_machines",
            "description": "List currently running machines.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_production_schedule",
            "description": "Get today's production schedule.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_production_plan",
            "description": "Show today's production plan.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_batch_status",
            "description": "Get running and completed batch status.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_batch_details",
            "description": "Get batch by batch code.",
            "parameters": {
                "type": "object",
                "properties": {"batch_number": {"type": "string"}},
                "required": ["batch_number"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "clock_in",
            "description": "Clock in the operator for today.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "clock_out",
            "description": "Clock out the operator for today.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_attendance",
            "description": "Get attendance for the current operator.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "work_order_action",
            "description": "Start, pause, resume, or complete a work order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "work_order_number": {"type": "string"},
                    "action": {"type": "string", "enum": ["start", "pause", "resume", "complete"]},
                },
                "required": ["work_order_number", "action"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_production_progress",
            "description": "Update production progress quantity for a work order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "work_order_number": {"type": "string"},
                    "produced_quantity": {"type": "number"},
                },
                "required": ["work_order_number", "produced_quantity"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "report_machine_breakdown",
            "description": "Report a machine breakdown.",
            "parameters": {
                "type": "object",
                "properties": {
                    "machine_code": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["machine_code", "description"],
            },
        },
    },
]

# Maps tool name → equivalent REST endpoint (for documentation / tracing)
API_ENDPOINT_MAP = {
    "get_todays_work_orders": "GET /api/workorders/today",
    "get_pending_work_orders": "GET /api/workorders",
    "get_assigned_work_orders": "GET /api/workorders/assigned",
    "get_work_order_by_number": "GET /api/workorders/{id}",
    "get_todays_production": "GET /api/dashboard/today",
    "get_machine_status": "GET /api/machines/status",
    "get_running_machines": "GET /api/machines/running",
    "get_production_schedule": "GET /api/schedule/today",
    "get_production_plan": "GET /api/production/plans/today",
    "get_batch_status": "GET /api/batches/running",
    "clock_in": "POST /api/operator/clockin",
    "clock_out": "POST /api/operator/clockout",
    "get_my_attendance": "GET /api/operator/attendance",
    "work_order_action": "POST /api/workorders/{action}",
    "update_production_progress": "POST /api/workorders/progress",
    "report_machine_breakdown": "POST /api/shopfloor/breakdown",
}


def _safe_call(fn, *args, **kwargs) -> dict:
    try:
        result = fn(*args, **kwargs)
        return {"success": True, "data": result, "endpoint": None}
    except HTTPException as exc:
        return {"success": False, "error": exc.detail, "status_code": exc.status_code}
    except Exception as exc:
        logger.exception("Function registry call failed")
        return {"success": False, "error": str(exc)}


def execute_tool(db: Session, user: User, tool_name: str, arguments: dict) -> dict:
    """Execute a tool via OperatorService — same data layer as /api routes."""
    svc = OperatorService(db, user.tenant_id)
    endpoint = API_ENDPOINT_MAP.get(tool_name)
    args = arguments or {}

    if tool_name == "get_todays_work_orders":
        data = svc.list_today_work_orders(user)
        if not data:
            fallback = svc.list_work_orders(user)
            orders = [w for w in fallback if isinstance(w, dict) and (w.get("status") in ("planned", "in_progress", "running", "paused") or w.get("planned_start"))]
        return {"success": True, "count": len(orders), "work_orders": orders, "endpoint": endpoint}

    if tool_name == "get_pending_work_orders":
        data = svc.list_work_orders(user)
        filtered = [w for w in data if isinstance(w, dict) and w.get("status") in ("planned", "pending", "released")]
        return {"success": True, "count": len(filtered), "work_orders": filtered, "endpoint": endpoint}

    if tool_name == "get_assigned_work_orders":
        data = svc.list_assigned_work_orders(user)
        return {"success": True, "count": len(data), "work_orders": data, "endpoint": endpoint}

    if tool_name == "get_work_order_by_number":
        wo = svc.work_orders.get_by_number(args.get("work_order_number", ""), user=user)
        if not wo:
            return {"success": True, "found": False, "message": "Work order not found.", "endpoint": endpoint}
        detail = svc.get_work_order(wo.id, user)
        return {"success": True, "found": True, "work_order": detail, "endpoint": endpoint}

    if tool_name == "get_todays_production":
        summary = svc.get_shop_floor_status()
        data = summary if isinstance(summary, dict) else {}
        target = data.get("todays_target")
        completed = data.get("todays_production")
        if target is None:
            target = getattr(summary, "todays_target", 0)
        if completed is None:
            completed = getattr(summary, "todays_production", 0)
        return {
            "success": True,
            "todays_target": target or 0,
            "todays_production": completed or 0,
            "endpoint": endpoint,
        }

    if tool_name == "get_machine_status":
        code = (args.get("machine_code") or "").strip()
        if code:
            machine = svc.machines.get_by_code(code)
            if not machine:
                return {"success": True, "found": False, "message": f"Machine {code} not found."}
            return {"success": True, "machines": [svc.get_machine(machine.id)], "endpoint": endpoint}
        machines = svc.list_machines()
        if not machines:
            machines = svc.get_machine_status_summary().get("machines", [])
        return {"success": True, "machines": machines, "endpoint": endpoint}

    if tool_name == "get_running_machines":
        machines = svc.list_running_machines()
        if not machines:
            machines = [m for m in svc.list_machines() if (m.get("status") or "").lower() in {"running", "in_progress", "active"}]
        return {"success": True, "machines": machines, "endpoint": endpoint}

    if tool_name == "get_production_schedule":
        return {"success": True, "schedule": svc.get_schedule_today(), "endpoint": endpoint}

    if tool_name == "get_production_plan":
        return {"success": True, "plans": svc.list_today_plans(), "endpoint": endpoint}

    if tool_name == "get_batch_status":
        return {
            "success": True,
            "running": svc.list_running_batches(),
            "completed": svc.list_completed_batches(),
            "endpoint": endpoint,
        }

    if tool_name == "get_batch_details":
        batches = svc.list_batches()
        code = (args.get("batch_number") or "").upper()
        match = next((b for b in batches if b.get("batch_code", "").upper() == code), None)
        if not match:
            return {"success": True, "found": False, "message": f"Batch {code} not found."}
        detail = svc.get_batch(match["id"])
        return {"success": True, "found": True, "batch": detail, "endpoint": endpoint}

    if tool_name == "clock_in":
        rec = svc.clock_in(user)
        return {"success": True, "attendance": rec.model_dump(), "endpoint": endpoint}

    if tool_name == "clock_out":
        rec = svc.clock_out(user)
        return {"success": True, "attendance": rec.model_dump(), "endpoint": endpoint}

    if tool_name == "get_my_attendance":
        return {"success": True, "attendance": svc.get_attendance(user), "endpoint": endpoint}

    if tool_name == "work_order_action":
        action = args.get("action", "start")
        payload = WorkOrderActionRequest(work_order_number=args.get("work_order_number"))
        handlers = {
            "start": svc.start_work_order,
            "pause": svc.pause_work_order,
            "resume": svc.resume_work_order,
            "complete": svc.complete_work_order,
        }
        handler = handlers.get(action)
        if not handler:
            return {"success": False, "error": f"Unknown action: {action}"}
        return _safe_call(handler, user, payload) | {"endpoint": endpoint}

    if tool_name == "update_production_progress":
        payload = WorkOrderProgressRequest(
            work_order_number=args.get("work_order_number"),
            produced_quantity=float(args.get("produced_quantity", 1)),
        )
        return _safe_call(svc.update_production_progress, user, payload) | {"endpoint": endpoint}

    if tool_name == "report_machine_breakdown":
        payload = MachineBreakdownRequest(
            machine_code=args.get("machine_code"),
            description=args.get("description", "Breakdown reported via AI assistant"),
        )
        return _safe_call(svc.report_breakdown, user, payload) | {"endpoint": endpoint}

    return {"success": False, "error": f"Unknown tool: {tool_name}"}


def format_tool_result(tool_name: str, result: dict) -> str:
    if result.get("error") and not result.get("success"):
        return str(result["error"])
    if tool_name == "get_todays_work_orders":
        orders = result.get("work_orders") or []
        if not orders:
            return "**Today's Work Orders**\n- Total: **0**\n- Planned: **0**\n- In Progress: **0**\n- Completed: **0**\n- Delayed: **0**"
        planned = sum(1 for wo in orders if (wo.get("status") or "").lower() in {"planned", "pending", "released"})
        in_progress = sum(1 for wo in orders if (wo.get("status") or "").lower() in {"in_progress", "running", "active"})
        completed = sum(1 for wo in orders if (wo.get("status") or "").lower() in {"completed", "done"})
        delayed = sum(1 for wo in orders if (wo.get("status") or "").lower() in {"delayed", "hold", "on_hold"})
        lines = [f"**Today's Work Orders ({result.get('count', len(orders))})**"]
        lines.append(f"- Total: **{result.get('count', len(orders))}**")
        lines.append(f"- Planned: **{planned}**")
        lines.append(f"- In Progress: **{in_progress}**")
        lines.append(f"- Completed: **{completed}**")
        lines.append(f"- Delayed: **{delayed}**")
        return "\n".join(lines)
    if tool_name == "get_todays_production":
        target = result.get("todays_target", 0)
        completed = result.get("todays_production", 0)
        return (
            "**Today's Production**\n"
            f"- Total: **{target:,}**\n"
            f"- Completed: **{completed:,}**\n"
            f"- Remaining: **{max(target - completed, 0):,}**\n"
            f"- Progress: **{round((completed / target * 100) if target else 0, 1)}%**"
        )
    if tool_name == "get_machine_status":
        machines = result.get("machines") or []
        if not machines:
            return "**Machine Status**\n- Total: **0**\n- Running/Working: **0**\n- Idle: **0**\n- Breakdown/Down: **0**\n- Maintenance: **0**"
        status_counts = {"running": 0, "working": 0, "idle": 0, "breakdown": 0, "down": 0, "maintenance": 0}
        for m in machines:
            status = (m.get("status") or "idle").lower()
            if status in {"running", "working", "active"}:
                status_counts["running"] += 1
            elif status in {"idle", "available"}:
                status_counts["idle"] += 1
            elif status in {"breakdown", "down", "stopped"}:
                status_counts["breakdown"] += 1
            elif status in {"maintenance", "maint"}:
                status_counts["maintenance"] += 1
        lines = ["**Machine Status**"]
        lines.append(f"- Total: **{len(machines)}**")
        lines.append(f"- Running/Working: **{status_counts['running']}**")
        lines.append(f"- Idle: **{status_counts['idle']}**")
        lines.append(f"- Breakdown/Down: **{status_counts['breakdown']}**")
        lines.append(f"- Maintenance: **{status_counts['maintenance']}**")
        return "\n".join(lines)
    if tool_name == "get_running_machines":
        machines = result.get("machines") or []
        if not machines:
            return "No machines are currently running."
        lines = ["**Running Machines**\n"]
        for m in machines[:10]:
            code = m.get("code") or m.get("machine_code") or "N/A"
            name = m.get("name") or m.get("machine_name") or ""
            line = f"- **{code}**"
            if name:
                line += f" {name}"
            lines.append(line)
        return "\n".join(lines)
    if tool_name == "get_batch_status":
        running = result.get("running") or []
        completed = result.get("completed") or []
        lines = ["**Batch Tracking**"]
        lines.append(f"- Total: **{len(running) + len(completed)}**")
        lines.append(f"- In Progress: **{len(running)}**")
        lines.append(f"- Completed: **{len(completed)}**")
        lines.append(f"- Delayed: **0**")
        lines.append(f"- Yield: **{round((sum(float(b.get('quantity') or 0) for b in completed) / max(sum(float(b.get('quantity') or 0) for b in running + completed), 1)) * 100, 1) if (running or completed) else 0}%**")
        return "\n".join(lines)
    if tool_name == "get_batch_details":
        batch = result.get("batch") or {}
        if not batch:
            return "No batch details available."
        qty = batch.get("quantity") or 0
        good = batch.get("good_qty") or 0
        scrap = batch.get("scrap_qty") or 0
        yield_pct = round((good / qty * 100) if qty else 0, 1)
        return (
            "**Batch Details**\n"
            f"- Batch: **{batch.get('batch_code') or 'N/A'}**\n"
            f"- Status: **{batch.get('status') or 'Unknown'}**\n"
            f"- Quantity: **{qty}**\n"
            f"- Good Qty: **{good}**\n"
            f"- Scrap Qty: **{scrap}**\n"
            f"- Yield: **{yield_pct}%**"
        )
    if tool_name == "get_my_attendance":
        attendance = result.get("attendance") or {}
        if isinstance(attendance, dict):
            return (
                "**HR Attendance**\n"
                f"- Present: **{attendance.get('present', 0)}**\n"
                f"- Absent: **{attendance.get('absent', 0)}**\n"
                f"- On Duty: **{attendance.get('on_duty', 0)}**\n"
                f"- Late/OT: **{attendance.get('late_or_ot', 0)}**"
            )
        return "**HR Attendance**\n- Present: **0**\n- Absent: **0**\n- On Duty: **0**\n- Late/OT: **0**"
    if tool_name in ("clock_in", "clock_out"):
        return f"**{tool_name.replace('_', ' ').title()}** recorded successfully."
    if result.get("data"):
        return f"**{tool_name.replace('_', ' ').title()}** completed successfully."
    return f"Action **{tool_name}** completed."
