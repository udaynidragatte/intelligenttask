"""FIFO execution queue endpoints."""

from flask import Blueprint, jsonify, request
from sqlalchemy import func

from ..data_structures import ArrayQueue
from ..database import db
from ..models import Task
from ..services import scheduler

bp = Blueprint("queue", __name__, url_prefix="/api")


def _queue_state() -> dict:
    """Read the queue rows from SQLite and render them through a real FIFO."""

    tasks = (
        Task.query.filter(Task.queue_position.isnot(None))
        .order_by(Task.queue_position.asc())
        .all()
    )
    queue = ArrayQueue()
    for task in tasks:
        queue.enqueue(task)

    items = [
        {**task.to_dict(), "position": index + 1}
        for index, task in enumerate(queue.to_list())
    ]

    return {
        "items": items,
        "count": queue.size(),
        "front": items[0] if items else None,
        "back": items[-1] if items else None,
        "order": "FIFO — the task enqueued first is processed first",
    }


def _task_id_from_request():
    data = request.get_json(silent=True) or {}
    try:
        return int(data.get("task_id"))
    except (TypeError, ValueError):
        return None


@bp.get("/queue")
def get_queue():
    return jsonify(_queue_state())


@bp.post("/queue/enqueue")
def enqueue_task():
    task_id = _task_id_from_request()
    if task_id is None:
        return jsonify({"error": "task_id must be a number"}), 400

    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": f"Task {task_id} was not found"}), 404
    if task.status == "Completed":
        return jsonify({"error": "Completed tasks cannot be enqueued — reopen the task first"}), 400
    if task.queue_position is not None:
        return jsonify({"error": f"'{task.title}' is already in the execution queue"}), 409

    highest = db.session.query(func.max(Task.queue_position)).scalar() or 0
    task.queue_position = highest + 1  # append at the back -> O(1)
    db.session.commit()

    return jsonify({**_queue_state(), "message": f"'{task.title}' enqueued"}), 201


@bp.post("/queue/dequeue")
def dequeue_task():
    """Remove the task at the front and start working on it."""

    tasks = (
        Task.query.filter(Task.queue_position.isnot(None))
        .order_by(Task.queue_position.asc())
        .all()
    )
    queue = ArrayQueue()
    for task in tasks:
        queue.enqueue(task)

    if queue.is_empty():
        return jsonify({"error": "The execution queue is empty"}), 400

    front: Task = queue.dequeue()
    front.queue_position = None
    if front.status == "Pending":
        front.status = "In Progress"
    db.session.commit()
    scheduler.sync("queue_dequeue")

    return jsonify(
        {
            **_queue_state(),
            "processed": front.to_dict(),
            "message": f"Dequeued '{front.title}' from the front of the queue",
        }
    )


@bp.post("/queue/remove")
def remove_from_queue():
    task_id = _task_id_from_request()
    if task_id is None:
        return jsonify({"error": "task_id must be a number"}), 400

    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": f"Task {task_id} was not found"}), 404
    if task.queue_position is None:
        return jsonify({"error": f"'{task.title}' is not inside the execution queue"}), 400

    task.queue_position = None
    db.session.commit()
    return jsonify({**_queue_state(), "message": f"'{task.title}' removed from the queue"})
