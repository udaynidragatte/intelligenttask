"""Dashboard statistics and list sections computed from the database."""

from __future__ import annotations

from datetime import date, datetime, timedelta

from ..models import PRIORITIES, Task


def _sorted_by_priority(tasks: list[Task]) -> list[Task]:
    return sorted(tasks, key=lambda t: (-t.priority_rank, t.deadline or date.max, t.id))


def build_dashboard() -> dict:
    today = date.today()
    tasks = Task.query.all()

    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == "Pending")
    in_progress = sum(1 for t in tasks if t.status == "In Progress")
    completed = sum(1 for t in tasks if t.status == "Completed")
    high_priority = sum(
        1 for t in tasks if t.priority in ("Critical", "High") and t.status != "Completed"
    )
    overdue = sum(1 for t in tasks if t.is_overdue())
    due_today = sum(1 for t in tasks if t.is_due_today() and t.status != "Completed")

    active = [t for t in tasks if t.status != "Completed"]

    today_tasks = _sorted_by_priority([t for t in active if t.is_due_today()])[:6]

    upcoming = sorted(
        [t for t in active if t.deadline and t.deadline > today],
        key=lambda t: (t.deadline, -t.priority_rank, t.id),
    )[:6]

    highest_priority = _sorted_by_priority(active)[:5]

    recently_completed = sorted(
        [t for t in tasks if t.status == "Completed" and t.completed_at],
        key=lambda t: t.completed_at,
        reverse=True,
    )[:5]

    priority_distribution = [
        {
            "name": priority,
            "value": sum(1 for t in tasks if t.priority == priority),
        }
        for priority in PRIORITIES
    ]

    weekly = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        count = sum(
            1
            for t in tasks
            if t.completed_at and t.completed_at.date() == day
        )
        weekly.append(
            {
                "date": day.isoformat(),
                "day": day.strftime("%a"),
                "completed": count,
            }
        )

    completion_rate = round((completed / total) * 100, 1) if total else 0.0

    return {
        "stats": {
            "total": total,
            "pending": pending,
            "completed": completed,
            "high_priority": high_priority,
            "overdue": overdue,
            "due_today": due_today,
        },
        "today_tasks": [t.to_dict() for t in today_tasks],
        "upcoming_deadlines": [t.to_dict() for t in upcoming],
        "highest_priority": [t.to_dict() for t in highest_priority],
        "recently_completed": [t.to_dict() for t in recently_completed],
        "completion_stats": {
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed,
            "completion_rate": completion_rate,
        },
        "priority_distribution": priority_distribution,
        "weekly_productivity": weekly,
        "generated_at": datetime.now().isoformat(),
    }
