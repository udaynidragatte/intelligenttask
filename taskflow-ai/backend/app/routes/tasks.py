"""Task CRUD endpoints."""

from flask import Blueprint, jsonify, request

from ..database import db
from ..models import PRIORITIES, STATUSES, Task, utcnow
from ..services import ValidationError, scheduler, validate_task_payload

bp = Blueprint("tasks", __name__, url_prefix="/api")


def _task_or_none(task_id: int):
    return db.session.get(Task, task_id)


def _not_found(task_id: int):
    return jsonify({"error": f"Task {task_id} was not found"}), 404


@bp.get("/tasks")
def list_tasks():
    """GET /api/tasks?status=Pending&priority=High&category=Academics"""

    query = Task.query
    status = request.args.get("status")
    priority = request.args.get("priority")
    category = request.args.get("category")

    if status:
        if status not in STATUSES:
            return jsonify({"error": f"Status must be one of: {', '.join(STATUSES)}"}), 400
        query = query.filter_by(status=status)
    if priority:
        if priority not in PRIORITIES:
            return jsonify({"error": f"Priority must be one of: {', '.join(PRIORITIES)}"}), 400
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)

    tasks = query.order_by(Task.id.asc()).all()
    return jsonify([task.to_dict() for task in tasks])


@bp.get("/tasks/<int:task_id>")
def get_task(task_id: int):
    task = _task_or_none(task_id)
    if task is None:
        return _not_found(task_id)
    return jsonify(task.to_dict())


@bp.post("/tasks")
def create_task():
    data = request.get_json(silent=True)
    try:
        cleaned = validate_task_payload(data if data is not None else {})
    except ValidationError as exc:
        return jsonify({"error": "Please fix the highlighted fields", "details": exc.errors}), 400

    task = Task(**cleaned)
    if "status" in cleaned and cleaned["status"] == "Completed":
        task.completed_at = utcnow()

    db.session.add(task)
    db.session.commit()

    # Every task change rebuilds the heap from the database.
    scheduler.sync("task_created")
    return jsonify(task.to_dict()), 201


@bp.put("/tasks/<int:task_id>")
def update_task(task_id: int):
    task = _task_or_none(task_id)
    if task is None:
        return _not_found(task_id)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    try:
        cleaned = validate_task_payload(data, partial=True)
    except ValidationError as exc:
        return jsonify({"error": "Please fix the highlighted fields", "details": exc.errors}), 400

    for field, value in cleaned.items():
        setattr(task, field, value)

    if "status" in cleaned:
        if cleaned["status"] == "Completed":
            task.completed_at = task.completed_at or utcnow()
            task.queue_position = None
        else:
            task.completed_at = None

    db.session.commit()
    scheduler.sync("task_updated")
    return jsonify(task.to_dict())


@bp.delete("/tasks/<int:task_id>")
def delete_task(task_id: int):
    task = _task_or_none(task_id)
    if task is None:
        return _not_found(task_id)

    db.session.delete(task)
    db.session.commit()
    scheduler.sync("task_deleted")
    return jsonify({"message": f"Task '{task.title}' deleted", "id": task_id})


@bp.patch("/tasks/<int:task_id>/complete")
def complete_task(task_id: int):
    """Mark a task complete, or reopen it when {"completed": false} is sent."""

    task = _task_or_none(task_id)
    if task is None:
        return _not_found(task_id)

    data = request.get_json(silent=True) or {}
    completed = data.get("completed")
    if completed is None:
        completed = task.status != "Completed"
    if not isinstance(completed, bool):
        return jsonify({"error": "'completed' must be true or false"}), 400

    if completed:
        task.status = "Completed"
        task.completed_at = utcnow()
        task.queue_position = None  # a completed task leaves the FIFO queue
        message = f"Task '{task.title}' completed"
    else:
        task.status = "Pending"
        task.completed_at = None
        message = f"Task '{task.title}' reopened"

    db.session.commit()
    scheduler.sync("task_completed" if completed else "task_reopened")
    return jsonify({"message": message, "task": task.to_dict()})
