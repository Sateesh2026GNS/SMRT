"""Lightweight pagination helpers for SQLAlchemy 2.0 select statements."""

from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200


@dataclass
class Page:
    items: list
    total: int
    page: int
    page_size: int

    @property
    def pages(self) -> int:
        return (self.total + self.page_size - 1) // self.page_size if self.page_size else 0

    def to_dict(self) -> dict:
        return {
            "items": self.items,
            "total": self.total,
            "page": self.page,
            "page_size": self.page_size,
            "pages": self.pages,
        }


def normalize_pagination(page: int | None, page_size: int | None) -> tuple[int, int]:
    p = max(DEFAULT_PAGE, page or DEFAULT_PAGE)
    size = page_size or DEFAULT_PAGE_SIZE
    size = max(1, min(size, MAX_PAGE_SIZE))
    return p, size


def paginate(db: Session, stmt, page: int | None = None, page_size: int | None = None) -> Page:
    """Run a select statement with limit/offset and return a Page with the total count."""
    p, size = normalize_pagination(page, page_size)
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = int(db.scalar(count_stmt) or 0)
    rows = list(db.scalars(stmt.limit(size).offset((p - 1) * size)).all())
    return Page(items=rows, total=total, page=p, page_size=size)
