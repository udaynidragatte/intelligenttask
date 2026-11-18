"""Application factory for the TaskFlow AI backend.

The factory keeps configuration, database setup, blueprints and error
handling in one place so the REST layer stays clean.
"""

from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from .database import db
from .routes import register_blueprints
from .services.sample_data import seed_database
from .services.scheduler import scheduler

BASE_DIR = Path(__file__).resolve().parent.parent


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{BASE_DIR / 'taskflow.db'}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False,
    )

    # The React dev server runs on another port, so API access needs CORS.
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)

    register_blueprints(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "TaskFlow AI API"})

    @app.errorhandler(404)
    def not_found(_error):
        if request.path.startswith("/api"):
            return jsonify({"error": "Resource not found"}), 404
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return jsonify({"error": "HTTP method not allowed for this endpoint"}), 405

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        # Create the SQLite tables and insert the sample tasks once.
        db.create_all()
        seed_database()
        # Build the binary heap from the pending tasks on startup.
        scheduler.sync("startup")

    return app
