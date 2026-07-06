"""Aggregate model imports.

Importing this package registers every ORM model on ``Base.metadata`` so that
``create_all`` and Alembic both see the complete schema.
"""

from app.models.base import Base  # noqa: F401

from app.models import (  # noqa: F401
    accounts,
    admin,
    alert,
    bom,
    company_settings,
    document,
    hr,
    inventory,
    machine,
    maintenance,
    procurement,
    product,
    production,
    quality,
    role,
    sales,
    task,
    tenant,
    user,
    security,
)
