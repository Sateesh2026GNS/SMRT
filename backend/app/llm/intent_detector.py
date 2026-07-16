"""Rule-based intent detection for operator commands."""

from __future__ import annotations

import re

INTENT_RULES: list[tuple[str, str, dict]] = [
    (r"today.*(?:work\s*order|job\s*card)|(?:work\s*order|job\s*card).*today", "get_todays_work_orders", {}),
    (r"(?:my\s+)?job\s*cards?|show\s+job\s*cards?", "get_todays_work_orders", {}),
    (r"(?:my\s+)?work\s*orders?|show\s+work\s*orders?", "get_todays_work_orders", {}),
    (r"pending\s+work\s*orders?", "get_pending_work_orders", {}),
    (r"assigned\s+jobs?|show\s+assigned", "get_assigned_work_orders", {}),
    (r"open\s+(?:work\s*order|job\s*card)\s+([\w-]+)|wo-?\s*(\d+)", "get_work_order_by_number", {}),
    (r"today.*target|production\s*target|today.*production", "get_todays_production", {}),
    (r"machine\s+([\w-]+)\s+status|([\w-]+)\s+status", "get_machine_status", {}),
    (r"machine\s+status|show\s+machines", "get_machine_status", {}),
    (r"running\s+machines?", "get_running_machines", {}),
    (r"production\s+schedule|today.*schedule|schedule", "get_production_schedule", {}),
    (r"production\s+plan|show\s+plan", "get_production_plan", {}),
    (r"batch\s+status|pending\s+batch", "get_batch_status", {}),
    (r"batch\s+([\w-]+)", "get_batch_details", {}),
    (r"clock\s*in|clockin", "clock_in", {}),
    (r"clock\s*out|clockout", "clock_out", {}),
    (r"my\s+attendance|attendance", "get_my_attendance", {}),
    (r"start\s+production|start\s+([\w-]+)", "work_order_action", {"action": "start"}),
    (r"pause\s+production|pause\s+([\w-]+)", "work_order_action", {"action": "pause"}),
    (r"resume\s+production|resume\s+([\w-]+)", "work_order_action", {"action": "resume"}),
    (r"complete\s+([\w-]+)|complete\s+work\s*order", "work_order_action", {"action": "complete"}),
    (r"update\s+progress|production\s+progress", "update_production_progress", {}),
    (r"report\s+breakdown|breakdown", "report_machine_breakdown", {}),
]


def detect_intent(message: str) -> tuple[str, dict] | None:
    text = message.strip().lower()
    text = re.sub(r"\bjob\s*cards?\b", "work orders", text)
    text = re.sub(r"\bjob\s*card\b", "work order", text)
    for pattern, tool, extra in INTENT_RULES:
        m = re.search(pattern, text, re.I)
        if not m:
            continue
        args = dict(extra)
        if tool == "get_work_order_by_number":
            wo = m.group(1) or (f"WO-{m.group(2)}" if m.lastindex and m.group(2) else None)
            if wo:
                args["work_order_number"] = wo.upper().replace(" ", "")
        elif tool == "get_machine_status" and m.lastindex:
            code = m.group(1) or m.group(2)
            if code:
                args["machine_code"] = code.upper()
        elif tool == "get_batch_details" and m.group(1):
            args["batch_number"] = m.group(1).upper()
        elif tool == "work_order_action" and m.lastindex and m.group(1):
            args["work_order_number"] = m.group(1).upper()
        return tool, args
    return None
