"""SQLAlchemy model for a task.

The database is the single source of truth: the priority queue, queue and
stack views are all rebuilt from these rows so the UI never shows fake data.
"""

from datetime import date, datetime

from ..database import db

PRIORITIES = ["Critical", "High", "Medium", "Low"]
STATUSES = ["Pending", "In Progress", "Completed"]

# Higher number = more important. Used by the heap and the sorting lab.
PRIORITY_RANK = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}


def utcnow() -> datetime:
    """Naive local timestamp (simple and readable for an academic project)."""

    return datetime.now()


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    priority = db.Column(db.String(20), nullable=False, default="Medium")
    deadline = db.Column(db.Date, nullable=True)
    duration = db.Column(db.Integer, nullable=False, default=60)  # minutes
    category = db.Column(db.String(60), nullable=False, default="General")
    status = db.Column(db.String(20), nullable=False, default="Pending")
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    # FIFO queue order. NULL means "not inside the execution queue".
    queue_position = db.Column(db.Integer, nullable=True)

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    @property
    def priority_rank(self) -> int:
        return PRIORITY_RANK.get(self.priority, 0)

    def is_overdue(self) -> bool:
        return bool(
            self.deadline
            and self.status != "Completed"
            and self.deadline < date.today()
        )

    def is_due_today(self) -> bool:
        return bool(self.deadline and self.deadline == date.today())

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "priority": self.priority,
            "priority_rank": self.priority_rank,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "duration": self.duration,
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "queue_position": self.queue_position,
            "is_overdue": self.is_overdue(),
            "is_due_today": self.is_due_today(),
        }

    def to_heap_item(self) -> dict:
        """Compact record stored inside the binary heap."""

        return {
            "id": self.id,
            "title": self.title,
            "priority": self.priority,
            "priority_rank": self.priority_rank,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "duration": self.duration,
            "category": self.category,
            "status": self.status,
        }

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Task {self.id} {self.title!r} {self.priority} {self.status}>"
