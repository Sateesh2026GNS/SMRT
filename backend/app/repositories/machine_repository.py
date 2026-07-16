"""Machine data access."""

from sqlalchemy import select

from app.models.machine import Machine
from app.repositories.base_repository import BaseRepository


class MachineRepository(BaseRepository):
    def list_all(self) -> list[Machine]:
        return list(
            self.db.scalars(
                select(Machine)
                .where(Machine.tenant_id == self.tenant_id)
                .order_by(Machine.code)
            ).all()
        )

    def get_by_id(self, machine_id: int) -> Machine | None:
        return self.db.scalars(
            select(Machine).where(
                Machine.id == machine_id,
                Machine.tenant_id == self.tenant_id,
            )
        ).first()

    def get_by_code(self, code: str) -> Machine | None:
        return self.db.scalars(
            select(Machine).where(
                Machine.tenant_id == self.tenant_id,
                Machine.code.ilike(code.strip()),
            )
        ).first()

    def list_by_status(self, *statuses: str) -> list[Machine]:
        return list(
            self.db.scalars(
                select(Machine).where(
                    Machine.tenant_id == self.tenant_id,
                    Machine.status.in_(statuses),
                )
            ).all()
        )

    def save(self, machine: Machine) -> Machine:
        self.db.commit()
        self.db.refresh(machine)
        return machine
