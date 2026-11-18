"""Stack endpoints: completed-task history with undo support."""

from flask import Blueprint, jsonify, request

from ..data_structures import Stack
from ..database import db
from ..models import Task, utcnow
from ..services import scheduler

bp = Blueprint("stack", __name__, url_prefix="/api")


def _stack_state() -> dict:
    """Build a LIFO stack from tasks ordered by completion time."""

    completed = [task for task in Task.query.all() if task.status == "Completed"]
    completed.sort(
        key=lambda task: (
            task.completed_at is None,
            task.completed_at or utcnow(),
            task.id,
        )
    )

    stack = Stack()
    for task in completed:
        stack.push(task)

    items = [
        {**task.to_dict(), "position": index + 1}
        for index, task in enumerate(stack.to_list())
    ]

    return {
        "items": items,
        "count": stack.size(),
        "top": items[-1] if items else None,
        "bottom": items[0] if items else None,
        "order": "LIFO — the most recently completed task is on top",
    }


def _task_id_from_request():
    data = request.get_json(silent=True) or {}
    try:
        return int(data.get("task_id"))
    except (TypeError, ValueError):
        return None


@bp.get("/stack")
def get_stack():
    return jsonify(_stack_state())


@bp.post("/stack/push")
def push_stack():
    """Complete a task and push it onto the stack (top of the history)."""

    task_id = _task_id_from_request()
    if task_id is None:
        return jsonify({"error": "task_id must be a number"}), 400

    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": f"Task {task_id} was not found"}), 404

    task.status = "Completed"
    task.completed_at = utcnow()
    task.queue_position = None
    db.session.commit()
    scheduler.sync("stack_push")

    return jsonify(
        {
            **_stack_state(),
            "pushed": task.to_dict(),
            "message": f"'{task.title}' pushed onto the stack",
        }
    )


@bp.post("/stack/pop")
def pop_stack():
    """Undo the most recent completion by reopening the top task."""

    tasks = (
        Task.query.filter_by(status="Completed")
        .filter(Task.completed_at.isnot(None))
        .order_by(Task.completed_at.asc(), Task.id.asc())
        .all()
    )
    stack = Stack()
    for task in tasks:
        stack.push(task)

    if stack.is_empty():
        return jsonify({"error": "The stack is empty — nothing to undo"}), 400

    popped: Task = stack.pop()
    popped.status = "Pending"
    popped.completed_at = None
    db.session.commit()
    scheduler.sync("stack_pop")

    return jsonify(
        {
            **_stack_state(),
            "popped": popped.to_dict(),
            "message": f"Undo complete: '{popped.title}' is pending again",
        }
    )
