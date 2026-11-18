"""Shared SQLAlchemy instance used by the models and the app factory."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
