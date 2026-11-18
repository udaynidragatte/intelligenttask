"""Priority scheduler service: keeps a real binary heap in sync with the DB.

The heap always contains every **Pending** task.  Any task create/update/delete
(and completing/reopening a task) rebuilds the heap, so the Priority Scheduler
page can never drift away from the dashboard.
"""

from __future__ import annotations

from ..data_structures import TaskPriorityQueue
from ..models import Task


class SchedulerService:
    def __init__(self) -> None:
        self.priority_queue = TaskPriorityQueue()
        self.last_action = "not started"

    def sync(self, action: str = "rebuild") -> None:
        """Rebuild the heap from the database with O(n) bottom-up heapify."""

        pending = Task.query.filter_by(status="Pending").order_by(Task.id.asc()).all()
        self.priority_queue.rebuild([task.to_heap_item() for task in pending])
        self.last_action = action

    def state(self) -> dict:
        return {
            "size": len(self.priority_queue),
            "heap": self.priority_queue.to_array(),
            "ordered": self.priority_queue.to_sorted(),
            "peek": self.priority_queue.peek(),
            "stats": self.priority_queue.stats(),
            "steps": list(self.priority_queue.steps),
            "operation": self.priority_queue.operation,
            "last_action": self.last_action,
            "rule": "Critical → High → Medium → Low, ties broken by the earliest deadline",
        }


# One scheduler shared by the whole Flask app (state is rebuilt from SQLite).
scheduler = SchedulerService()
