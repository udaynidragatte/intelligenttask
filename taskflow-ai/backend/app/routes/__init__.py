"""Blueprint registration for the REST API."""

from flask import Flask


def register_blueprints(app: Flask) -> None:
    from .algorithm_routes import bp as algorithm_bp
    from .dashboard_routes import bp as dashboard_bp
    from .priority_routes import bp as priority_bp
    from .queue_routes import bp as queue_bp
    from .stack_routes import bp as stack_bp
    from .tasks import bp as tasks_bp

    for blueprint in (tasks_bp, dashboard_bp, priority_bp, queue_bp, stack_bp, algorithm_bp):
        app.register_blueprint(blueprint)
