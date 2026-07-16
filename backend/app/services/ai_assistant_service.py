"""AI Operator Assistant — orchestration, caching, conversation history."""

from __future__ import annotations

import json
import logging
import time
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.ai_conversation import AiConversation, AiMessage
from app.models.user import User
from app.llm.function_registry import TOOL_DEFINITIONS, execute_tool, format_tool_result
from app.llm.intent_detector import detect_intent
from app.llm.llm_service import LlmClient
from app.llm.prompt_templates import API_FAIL_REPLY, OUT_OF_SCOPE_REPLY, SUGGESTIONS, SYSTEM_PROMPT

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


def _get_or_create_conversation(
    db: Session, user: User, conversation_id: int | None, first_message: str
) -> AiConversation:
    if conversation_id:
        conv = db.scalar(
            select(AiConversation).where(
                AiConversation.id == conversation_id,
                AiConversation.user_id == user.id,
            )
        )
        if conv:
            return conv
    title = (first_message[:60] + "…") if len(first_message) > 60 else first_message
    conv = AiConversation(user_id=user.id, tenant_id=user.tenant_id, title=title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def _save_message(
    db: Session,
    conv: AiConversation,
    role: str,
    content: str,
    tool_name: str | None = None,
    navigation: str | None = None,
) -> None:
    db.add(
        AiMessage(
            conversation_id=conv.id,
            role=role,
            content=content,
            tool_name=tool_name,
            navigation_path=navigation,
        )
    )
    db.commit()


def _run_tool(db: Session, user: User, tool_name: str, args: dict) -> tuple[dict, str]:
    cache_key = f"{user.id}:{tool_name}:{json.dumps(args, sort_keys=True)}"
    cached = _cache_get(cache_key)
    if cached:
        return cached, format_tool_result(tool_name, cached)
    result = execute_tool(db, user, tool_name, args or {})
    if result.get("success"):
        _cache_set(cache_key, result)
    return result, format_tool_result(tool_name, result)


def _process_with_rules(db: Session, user: User, message: str) -> dict:
    intent = detect_intent(message)
    if not intent:
        lower = message.lower()
        if any(w in lower for w in ("finance", "payroll", "salary", "gst", "profit", "settings", "user")):
            return {
                "message": OUT_OF_SCOPE_REPLY,
                "navigation": None,
                "used_tools": [],
                "source": "rules",
            }
        return {
            "message": OUT_OF_SCOPE_REPLY,
            "navigation": None,
            "used_tools": [],
            "source": "rules",
        }

    tool_name, args = intent
    result, text = _run_tool(db, user, tool_name, args)
    if not result.get("success") and result.get("error"):
        text = result["error"]
    return {
        "message": text,
        "navigation": result.get("navigation"),
        "used_tools": [tool_name],
        "source": "rules",
    }


def _process_with_llm(db: Session, user: User, message: str, history: list[dict]) -> dict:
    client = LlmClient()
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history[-8:])
    messages.append({"role": "user", "content": message})

    response = client.chat(messages, tools=TOOL_DEFINITIONS)
    if response.get("error") or not response.get("choices"):
        return _process_with_rules(db, user, message)

    choice = response["choices"][0]["message"]
    tool_calls = choice.get("tool_calls") or []

    if not tool_calls:
        content = choice.get("content") or OUT_OF_SCOPE_REPLY
        return {
            "message": content,
            "navigation": None,
            "used_tools": [],
            "source": "llm",
        }

    used_tools: list[str] = []
    navigation: str | None = None
    parts: list[str] = []

    for tc in tool_calls:
        fn = tc.get("function", {})
        tool_name = fn.get("name", "")
        try:
            args = json.loads(fn.get("arguments") or "{}")
        except json.JSONDecodeError:
            args = {}
        result, text = _run_tool(db, user, tool_name, args)
        used_tools.append(tool_name)
        if result.get("navigation"):
            navigation = result["navigation"]
        parts.append(text)

    follow_messages = messages + [choice]
    for i, tc in enumerate(tool_calls):
        follow_messages.append({
            "role": "tool",
            "tool_call_id": tc.get("id", f"call_{i}"),
            "content": parts[i] if i < len(parts) else "{}",
        })

    final = client.chat(follow_messages)
    if final.get("choices"):
        summary = final["choices"][0]["message"].get("content")
        if summary:
            return {
                "message": summary,
                "navigation": navigation,
                "used_tools": used_tools,
                "source": "llm",
            }

    return {
        "message": "\n\n".join(parts),
        "navigation": navigation,
        "used_tools": used_tools,
        "source": "llm",
    }


def process_chat(
    db: Session,
    user: User,
    message: str,
    conversation_id: int | None = None,
) -> dict:
    conv = _get_or_create_conversation(db, user, conversation_id, message)
    _save_message(db, conv, "user", message)

    history_rows = list(
        db.scalars(
            select(AiMessage)
            .where(AiMessage.conversation_id == conv.id)
            .order_by(AiMessage.id.asc())
        ).all()
    )
    history = [{"role": m.role if m.role != "tool" else "assistant", "content": m.content} for m in history_rows[:-1]]

    client = LlmClient()
    try:
        if client.enabled:
            outcome = _process_with_llm(db, user, message, history)
        else:
            outcome = _process_with_rules(db, user, message)
    except Exception:
        logger.exception("AI chat processing failed")
        outcome = {"message": API_FAIL_REPLY, "navigation": None, "used_tools": [], "source": "error"}

    _save_message(
        db,
        conv,
        "assistant",
        outcome["message"],
        tool_name=",".join(outcome.get("used_tools") or []),
        navigation=outcome.get("navigation"),
    )

    return {
        "conversation_id": conv.id,
        "message": outcome["message"],
        "navigation": outcome.get("navigation"),
        "suggestions": SUGGESTIONS,
        "used_tools": outcome.get("used_tools", []),
        "source": outcome.get("source", "rules"),
    }


def list_conversations(db: Session, user: User) -> list[dict]:
    rows = db.scalars(
        select(AiConversation)
        .where(AiConversation.user_id == user.id)
        .order_by(AiConversation.updated_at.desc())
        .limit(20)
    ).all()
    result = []
    for c in rows:
        count = db.scalar(
            select(func.count(AiMessage.id)).where(AiMessage.conversation_id == c.id)
        ) or 0
        result.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else "",
            "message_count": count,
        })
    return result


def get_conversation(db: Session, user: User, conversation_id: int) -> dict | None:
    conv = db.scalar(
        select(AiConversation).where(
            AiConversation.id == conversation_id,
            AiConversation.user_id == user.id,
        )
    )
    if not conv:
        return None
    messages = list(
        db.scalars(
            select(AiMessage)
            .where(AiMessage.conversation_id == conv.id)
            .order_by(AiMessage.id.asc())
        ).all()
    )
    return {
        "id": conv.id,
        "title": conv.title,
        "messages": [{"role": m.role, "content": m.content} for m in messages if m.role in ("user", "assistant")],
    }
