"""AI Operator Agent — orchestrates LLM function calling with live ERP data."""

from __future__ import annotations

import json
import logging
import time
from typing import Any

from sqlalchemy.orm import Session

from app.llm.function_registry import TOOL_DEFINITIONS, execute_tool, format_tool_result
from app.llm.intent_detector import detect_intent
from app.llm.llm_service import LlmClient
from app.llm.prompt_templates import API_FAIL_REPLY, OUT_OF_SCOPE_REPLY, SUGGESTIONS, SYSTEM_PROMPT
from app.models.user import User

logger = logging.getLogger(__name__)

_cache: dict[str, tuple[float, Any]] = {}
CACHE_TTL = 45


def _cache_get(key: str) -> Any | None:
    entry = _cache.get(key)
    if not entry:
        return None
    ts, val = entry
    if time.time() - ts > CACHE_TTL:
        del _cache[key]
        return None
    return val


def _cache_set(key: str, val: Any) -> None:
    _cache[key] = (time.time(), val)


class OperatorAgent:
    def __init__(self) -> None:
        self.llm = LlmClient()

    def get_suggestions(self) -> list[str]:
        return list(SUGGESTIONS)

    def process_message(self, db: Session, user: User, message: str) -> dict:
        message = (message or "").strip()
        if not message:
            return {"reply": "Please enter a message.", "tool_used": None, "tool_result": None}

        cache_key = f"{user.id}:{message.lower()[:80]}"
        cached = _cache_get(cache_key)
        if cached:
            return cached

        tool_used = None
        tool_result = None
        reply = ""

        if self.llm.enabled:
            reply, tool_used, tool_result = self._llm_path(db, user, message)
        else:
            reply, tool_used, tool_result = self._rule_path(db, user, message)

        if not reply:
            reply = API_FAIL_REPLY

        result = {"reply": reply, "tool_used": tool_used, "tool_result": tool_result}
        _cache_set(cache_key, result)
        return result

    def _rule_path(self, db: Session, user: User, message: str) -> tuple[str, str | None, dict | None]:
        intent = detect_intent(message)
        if not intent:
            return OUT_OF_SCOPE_REPLY, None, None
        tool_name, args = intent
        tool_result = execute_tool(db, user, tool_name, args)
        if not tool_result.get("success") and tool_result.get("error"):
            return str(tool_result["error"]), tool_name, tool_result
        return format_tool_result(tool_name, tool_result), tool_name, tool_result

    def _llm_path(self, db: Session, user: User, message: str) -> tuple[str, str | None, dict | None]:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ]
        response = self.llm.chat(messages, tools=TOOL_DEFINITIONS)
        choices = response.get("choices") or []
        if not choices:
            return self._rule_path(db, user, message)

        choice = choices[0]
        msg = choice.get("message") or {}
        tool_calls = msg.get("tool_calls") or []

        if not tool_calls:
            content = msg.get("content") or ""
            if content:
                return content, None, None
            return self._rule_path(db, user, message)

        tool_used = None
        tool_result = None
        for tc in tool_calls:
            fn = tc.get("function") or {}
            tool_name = fn.get("name")
            try:
                args = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {}
            tool_used = tool_name
            tool_result = execute_tool(db, user, tool_name, args)
            messages.append(msg)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.get("id"),
                "content": json.dumps(tool_result, default=str),
            })

        final = self.llm.chat(messages, tools=TOOL_DEFINITIONS)
        final_choices = final.get("choices") or []
        if final_choices:
            reply = (final_choices[0].get("message") or {}).get("content") or ""
            if reply:
                return reply, tool_used, tool_result

        if tool_used and tool_result:
            return format_tool_result(tool_used, tool_result), tool_used, tool_result
        return API_FAIL_REPLY, tool_used, tool_result
