"""Extend access_logs for enterprise audit fields.

Revision ID: a1b2c3d4e5f6
Revises: de8b5e165733
Create Date: 2026-07-19
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "de8b5e165733"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_COLUMNS = [
    ("company_id", sa.Integer()),
    ("company_name", sa.String(255)),
    ("full_name", sa.String(255)),
    ("email", sa.String(255)),
    ("role", sa.String(100)),
    ("module_name", sa.String(64)),
    ("login_status", sa.String(32)),
    ("browser", sa.String(128)),
    ("operating_system", sa.String(128)),
    ("device_type", sa.String(32)),
    ("session_id", sa.String(64)),
    ("login_at", sa.DateTime(timezone=True)),
    ("logout_at", sa.DateTime(timezone=True)),
    ("details", sa.Text()),
]


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing = {c["name"] for c in inspector.get_columns("access_logs")}
    for name, col_type in _COLUMNS:
        if name not in existing:
            op.add_column("access_logs", sa.Column(name, col_type, nullable=True))

    # Best-effort indexes (SQLite ignores IF NOT EXISTS via try/except pattern)
    for idx_name, cols in [
        ("ix_access_logs_company_id", ["company_id"]),
        ("ix_access_logs_module_name", ["module_name"]),
        ("ix_access_logs_login_at", ["login_at"]),
        ("ix_access_logs_session_id", ["session_id"]),
        ("ix_access_logs_login_status", ["login_status"]),
    ]:
        try:
            op.create_index(idx_name, "access_logs", cols)
        except Exception:
            pass

    # Backfill company_id from tenant_id where missing
    try:
        op.execute(sa.text("UPDATE access_logs SET company_id = tenant_id WHERE company_id IS NULL"))
    except Exception:
        pass


def downgrade() -> None:
    for name, _ in reversed(_COLUMNS):
        try:
            op.drop_column("access_logs", name)
        except Exception:
            pass
