"""Dashboard aggregation endpoint."""

from flask import Blueprint, jsonify

from ..services import build_dashboard

bp = Blueprint("dashboard", __name__, url_prefix="/api")


@bp.get("/dashboard/stats")
def dashboard_stats():
    """Return every number and list the dashboard renders."""

    return jsonify(build_dashboard())
