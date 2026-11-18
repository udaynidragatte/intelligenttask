"""Input validation for task create/update requests."""

from __future__ import annotations

from datetime import date

from ..models import PRIORITIES, STATUSES


class ValidationError(Exception):
    """Raised with a field -> message map that is returned as HTTP 400."""

    def __init__(self, errors: dict):
        super().__init__("Validation failed")
        self.errors = errors


def _parse_deadline(value):
    if value in (None, ""):
        return None
    if not isinstance(value, str):
        raise ValueError("Deadline must be a date string like 2026-11-20")
    text = value.strip()
    if not text:
        return None
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        raise ValueError("Deadline must use the YYYY-MM-DD format") from None


def validate_task_payload(data, partial: bool = False) -> dict:
    """Return a cleaned dict of task fields or raise :class:`ValidationError`.

    ``partial=True`` validates only the keys that were provided (used by PUT),
    which keeps updates lightweight while still rejecting bad values.
    """

    if not isinstance(data, dict):
        raise ValidationError({"body": "A JSON object is required"})

    errors: dict[str, str] = {}
    cleaned: dict = {}

    # Title -------------------------------------------------------------
    if not partial or "title" in data:
        title = str(data.get("title") or "").strip()
        if len(title) < 2:
            errors["title"] = "Title must be at least 2 characters long"
        elif len(title) > 160:
            errors["title"] = "Title must be 160 characters or fewer"
        else:
            cleaned["title"] = title

    # Description -------------------------------------------------------
    if "description" in data or not partial:
        description = data.get("description") or ""
        if not isinstance(description, str):
            errors["description"] = "Description must be text"
        elif len(description) > 2000:
            errors["description"] = "Description must be 2000 characters or fewer"
        else:
            cleaned["description"] = description.strip()

    # Priority ----------------------------------------------------------
    if not partial or "priority" in data:
        raw = str(data.get("priority") or "").strip()
        priority = next((p for p in PRIORITIES if p.lower() == raw.lower()), None)
        if priority is None:
            errors["priority"] = f"Priority must be one of: {', '.join(PRIORITIES)}"
        else:
            cleaned["priority"] = priority

    # Deadline ----------------------------------------------------------
    if "deadline" in data or not partial:
        try:
            cleaned["deadline"] = _parse_deadline(data.get("deadline"))
        except ValueError as exc:
            errors["deadline"] = str(exc)

    # Duration ----------------------------------------------------------
    if not partial or "duration" in data:
        raw = data.get("duration")
        try:
            minutes = int(raw)
        except (TypeError, ValueError):
            errors["duration"] = "Duration must be a whole number of minutes"
        else:
            if minutes < 1 or minutes > 100000:
                errors["duration"] = "Duration must be between 1 and 100000 minutes"
            else:
                cleaned["duration"] = minutes

    # Category ----------------------------------------------------------
    if "category" in data or not partial:
        category = str(data.get("category") or "").strip() or "General"
        if len(category) > 60:
            errors["category"] = "Category must be 60 characters or fewer"
        else:
            cleaned["category"] = category

    # Status ------------------------------------------------------------
    if "status" in data:
        raw = str(data.get("status") or "").strip()
        status = next((s for s in STATUSES if s.lower() == raw.lower()), None)
        if status is None:
            errors["status"] = f"Status must be one of: {', '.join(STATUSES)}"
        else:
            cleaned["status"] = status

    if errors:
        raise ValidationError(errors)
    return cleaned
