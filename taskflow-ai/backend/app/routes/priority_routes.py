"""Priority queue endpoints backed by the binary max-heap."""

from flask import Blueprint, jsonify, request

from ..database import db
from ..models import Task
from ..services import scheduler

bp = Blueprint("priority", __name__, url_prefix="/api")


def _task_id_from_request():
    data = request.get_json(silent=True) or {}
    raw = data.get("task_id")
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


@bp.get("/priority-queue")
def get_priority_queue():
    """Heap array (with tree metadata), extraction order and last operation."""

    return jsonify(scheduler.state())


@bp.get("/priority-queue/peek")
def peek_priority_queue():
    top = scheduler.priority_queue.peek()
    if top is None:
        return jsonify({"peek": None, "size": 0}), 200
    return jsonify({"peek": top, "size": len(scheduler.priority_queue)})


@bp.post("/priority-queue/insert")
def insert_into_priority_queue():
    task_id = _task_id_from_request()
    if task_id is None:
        return jsonify({"error": "task_id must be a number"}), 400

    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": f"Task {task_id} was not found"}), 404
    if task.status == "Completed":
        return jsonify({"error": "Completed tasks cannot be added to the priority queue"}), 400

    # Refresh the heap from SQLite before the explicit insert.
    scheduler.sync("insert")
    if scheduler.priority_queue.contains(task.id):
        return (
            jsonify({"error": f"'{task.title}' is already in the priority queue"}),
            409,
        )

    # Re-inserted in-progress work becomes pending again.
    if task.status != "Pending":
        task.status = "Pending"
        db.session.commit()

    scheduler.priority_queue.insert(task.to_heap_item())
    return jsonify({**scheduler.state(), "inserted": task.to_dict()})


@bp.post("/priority-queue/process")
def process_priority_queue():
    """Remove the highest-priority task and start working on it."""

    scheduler.sync("process")
    if scheduler.priority_queue.peek() is None:
        return jsonify({"error": "The priority queue is empty — add a pending task first"}), 400

    item = scheduler.priority_queue.extract_max()  # real heap sift-down
    task = db.session.get(Task, item["id"])

    if task is not None:
        task.status = "In Progress"
        task.queue_position = None
        db.session.commit()

    return jsonify(
        {
            **scheduler.state(),
            "processed": task.to_dict() if task else item,
            "message": f"Processed highest-priority task: {item['title']}",
        }
    )


@bp.post("/priority-queue/rebuild")
def rebuild_priority_queue():
    scheduler.sync("manual_rebuild")
    return jsonify(scheduler.state())
