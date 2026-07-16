"""Aggregate model imports.

Importing this package registers every ORM model on ``Base.metadata`` so that
``create_all`` and Alembic both see the complete schema.
"""

from app.models.base import Base  # noqa: F401

from app.models import (  # noqa: F401
    accounts,
    ai_conversation,
    alert,
    bom,
    company_settings,
    department,
    document,
    hr,
    inventory,
    machine,
    maintenance,
    erp_notification,
    notification,
    procurement,
    product,
    production,
    quality,
    role,
    sales,
    security,
    task,
    tenant,
    user,
)
