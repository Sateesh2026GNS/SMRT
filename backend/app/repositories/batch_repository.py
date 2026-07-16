"""Production batch data access."""

from sqlalchemy import select

from app.models.production import Batch
from app.repositories.base_repository import BaseRepository


class BatchRepository(BaseRepository):
    def list_all(self) -> list[Batch]:
        return list(
            self.db.scalars(
                select(Batch)
                .where(Batch.tenant_id == self.tenant_id)
                .order_by(Batch.id.desc())
            ).all()
        )

    def get_by_id(self, batch_id: int) -> Batch | None:
        return self.db.scalars(
            select(Batch).where(
                Batch.id == batch_id,
                Batch.tenant_id == self.tenant_id,
            )
        ).first()

    def list_by_status(self, *statuses: str) -> list[Batch]:
        return list(
            self.db.scalars(
                select(Batch).where(
                    Batch.tenant_id == self.tenant_id,
                    Batch.status.in_(statuses),
                )
            ).all()
        )

    def save(self, batch: Batch) -> Batch:
        self.db.commit()
        self.db.refresh(batch)
        return batch
