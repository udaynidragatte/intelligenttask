"""Sorting and searching lab endpoints."""

from flask import Blueprint, jsonify, request

from ..algorithms import SEARCH_ALGORITHMS, SEARCH_FIELDS, SORT_ALGORITHMS, SORT_FIELDS
from ..algorithms import search_tasks, sort_tasks
from ..models import Task

bp = Blueprint("algorithms", __name__, url_prefix="/api")


def _all_tasks_as_dicts() -> list[dict]:
    return [task.to_dict() for task in Task.query.order_by(Task.id.asc()).all()]


@bp.get("/algorithms")
def algorithm_catalog():
    """Metadata used by the frontend selects and explanation panels."""

    return jsonify(
        {
            "sorting": SORT_ALGORITHMS,
            "sort_fields": SORT_FIELDS,
            "searching": SEARCH_ALGORITHMS,
            "search_fields": SEARCH_FIELDS,
        }
    )


@bp.post("/sort")
def sort_endpoint():
    data = request.get_json(silent=True) or {}
    algorithm = str(data.get("algorithm") or "").strip().lower()
    field = str(data.get("field") or "").strip().lower()

    if not algorithm:
        return jsonify({"error": "Choose a sorting algorithm"}), 400
    if not field:
        return jsonify({"error": "Choose a field to sort by"}), 400

    tasks = _all_tasks_as_dicts()
    if not tasks:
        return jsonify({"error": "There are no tasks to sort yet"}), 400

    try:
        payload = sort_tasks(tasks, algorithm, field)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(payload)


@bp.get("/search")
def search_endpoint():
    algorithm = (request.args.get("algorithm") or "").strip().lower()
    field = (request.args.get("field") or "").strip().lower()
    query = request.args.get("query") or ""

    if not algorithm:
        return jsonify({"error": "Choose a search algorithm"}), 400
    if not field:
        return jsonify({"error": "Choose a field to search by"}), 400
    if not query.strip():
        return jsonify({"error": "Enter something to search for"}), 400

    tasks = _all_tasks_as_dicts()
    try:
        payload = search_tasks(tasks, algorithm, field, query)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(payload)
