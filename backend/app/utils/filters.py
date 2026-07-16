"""Helpers for applying common filters to SQLAlchemy select statements."""

from typing import Any


def apply_equals(stmt, column, value: Any):
    """Apply an equality filter when value is not None."""
    if value is not None:
        return stmt.where(column == value)
    return stmt


def apply_in(stmt, column, values):
    if values:
        return stmt.where(column.in_(list(values)))
    return stmt


def apply_search(stmt, columns, term: str | None):
    """Case-insensitive OR ilike across the given columns."""
    if not term:
        return stmt
    from sqlalchemy import or_

    like = f"%{term.strip()}%"
    return stmt.where(or_(*[c.ilike(like) for c in columns]))


def apply_date_range(stmt, column, date_from=None, date_to=None):
    if date_from is not None:
        stmt = stmt.where(column >= date_from)
    if date_to is not None:
        stmt = stmt.where(column <= date_to)
    return stmt
