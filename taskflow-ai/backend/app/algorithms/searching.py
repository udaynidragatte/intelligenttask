"""Linear Search and Binary Search implemented manually.

Binary Search only works on sorted data, so the module first sorts the task
array by the requested field using our own Merge Sort and then searches it.
"""

from __future__ import annotations

import time

from .sorting import SortMetrics

PRIORITY_RANK = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}

SEARCH_FIELDS = {
    "id": {"label": "Task ID", "note": "Exact numeric task id"},
    "title": {"label": "Task Name", "note": "Linear: text contains the query. Binary: exact name match"},
    "priority": {"label": "Priority", "note": "Critical, High, Medium or Low"},
    "category": {"label": "Category", "note": "Linear: text contains the query. Binary: exact category match"},
}

SEARCH_ALGORITHMS = {
    "linear": {
        "label": "Linear Search",
        "best": "O(1)",
        "average": "O(n)",
        "worst": "O(n)",
        "space": "O(1)",
        "explanation": (
            "Linear Search checks every task one by one until the query matches. It works on "
            "unsorted data and can find every matching task, but the work grows linearly with "
            "the number of tasks."
        ),
    },
    "binary": {
        "label": "Binary Search",
        "best": "O(1)",
        "average": "O(log n)",
        "worst": "O(log n)",
        "space": "O(1)",
        "explanation": (
            "Binary Search repeatedly halves the search range by comparing the middle element "
            "with the target. It is far faster than Linear Search, but the array must be sorted "
            "on the searched key first (this lab sorts it with Merge Sort before each search). "
            "It finds an exact key, not a substring."
        ),
    },
}


def _normalise(field: str, task: dict):
    """Value used for comparisons, kept consistent between sort and search."""

    if field == "id":
        return int(task["id"])
    if field == "title":
        return (task.get("title") or "").lower()
    if field == "category":
        return (task.get("category") or "").lower()
    if field == "priority":
        return PRIORITY_RANK.get(task.get("priority"), 0)
    raise ValueError(f"Unknown search field: {field}")


def _target(field: str, query: str):
    text = (query or "").strip()
    if not text:
        raise ValueError("A search query is required")

    if field == "id":
        try:
            return int(text)
        except ValueError:
            raise ValueError("Task ID must be a number (for example 3)") from None
    if field == "priority":
        for name, rank in PRIORITY_RANK.items():
            if name.lower() == text.lower():
                return rank
        raise ValueError("Priority must be Critical, High, Medium or Low")
    return text.lower()


def _sort_for_binary(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    """Merge Sort the tasks in ascending order of the searched key.

    Binary Search requires ascending data.  ``sorting._compare`` sorts priority
    highest-first for the dashboard, so the search lab uses its own merge step
    on the normalised key to guarantee the precondition.
    """

    if len(tasks) <= 1:
        return list(tasks)

    mid = len(tasks) // 2
    left = _sort_for_binary(tasks[:mid], field, metrics)
    right = _sort_for_binary(tasks[mid:], field, metrics)

    merged: list[dict] = []
    i = j = 0
    while i < len(left) and j < len(right):
        metrics.comparisons += 1
        if _normalise(field, left[i]) <= _normalise(field, right[j]):
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
        metrics.moves += 1
    while i < len(left):
        merged.append(left[i])
        i += 1
        metrics.moves += 1
    while j < len(right):
        merged.append(right[j])
        j += 1
        metrics.moves += 1
    return merged


def _linear_search(tasks: list[dict], field: str, query: str, metrics: SortMetrics) -> list[dict]:
    text = query.strip().lower()
    matches: list[dict] = []

    for task in tasks:
        metrics.comparisons += 1
        if field == "id":
            if str(task["id"]) == text:
                matches.append(task)
        elif field == "title":
            if text in (task.get("title") or "").lower():
                matches.append(task)
        elif field == "category":
            if text in (task.get("category") or "").lower():
                matches.append(task)
        elif field == "priority":
            if text == (task.get("priority") or "").lower():
                matches.append(task)
    return matches


def _binary_search(sorted_tasks: list[dict], field: str, target, metrics: SortMetrics) -> list[dict]:
    low, high = 0, len(sorted_tasks) - 1
    found_index = None

    while low <= high:
        mid = (low + high) // 2
        metrics.comparisons += 1
        value = _normalise(field, sorted_tasks[mid])
        if value == target:
            found_index = mid
            break
        if value < target:
            low = mid + 1
        else:
            high = mid - 1

    if found_index is None:
        return []

    # Collect equal keys around the found index (duplicates stay adjacent).
    matches = [sorted_tasks[found_index]]
    index = found_index - 1
    while index >= 0:
        metrics.comparisons += 1
        if _normalise(field, sorted_tasks[index]) == target:
            matches.append(sorted_tasks[index])
            index -= 1
        else:
            break

    index = found_index + 1
    while index < len(sorted_tasks):
        metrics.comparisons += 1
        if _normalise(field, sorted_tasks[index]) == target:
            matches.append(sorted_tasks[index])
            index += 1
        else:
            break

    # Preserve the original (sorted) order of the matches.
    order = {task["id"]: position for position, task in enumerate(sorted_tasks)}
    matches.sort(key=lambda task: order[task["id"]])
    return matches


def search_tasks(tasks: list[dict], algorithm: str, field: str, query: str) -> dict:
    """Run one search algorithm and report comparisons + timing."""

    if algorithm not in SEARCH_ALGORITHMS:
        raise ValueError(
            f"Unknown search algorithm '{algorithm}'. Choose one of: {', '.join(SEARCH_ALGORITHMS)}"
        )
    if field not in SEARCH_FIELDS:
        raise ValueError(
            f"Unknown search field '{field}'. Choose one of: {', '.join(SEARCH_FIELDS)}"
        )

    metrics = SortMetrics()
    preparation = None
    started = time.perf_counter()

    if algorithm == "linear":
        if not query or not query.strip():
            raise ValueError("A search query is required")
        results = _linear_search(tasks, field, query, metrics)
    else:
        target = _target(field, query)
        sort_metrics = SortMetrics()
        sort_started = time.perf_counter()
        ordered = _sort_for_binary(tasks, field, sort_metrics)
        sort_ms = (time.perf_counter() - sort_started) * 1000
        results = _binary_search(ordered, field, target, metrics)
        preparation = {
            "sorted_by": field,
            "sort_algorithm": "Merge Sort",
            "sort_comparisons": sort_metrics.comparisons,
            "sort_moves": sort_metrics.moves,
            "sort_time_ms": round(sort_ms, 4),
        }

    elapsed_ms = (time.perf_counter() - started) * 1000
    meta = SEARCH_ALGORITHMS[algorithm]

    return {
        "algorithm": algorithm,
        "label": meta["label"],
        "field": field,
        "field_label": SEARCH_FIELDS[field]["label"],
        "query": query,
        "results": results,
        "matches": len(results),
        "scanned": len(tasks),
        "comparisons": metrics.comparisons,
        "execution_time_ms": round(elapsed_ms, 4),
        "complexity": {
            "best": meta["best"],
            "average": meta["average"],
            "worst": meta["worst"],
            "space": meta["space"],
        },
        "explanation": meta["explanation"],
        "note": SEARCH_FIELDS[field]["note"],
        "preparation": preparation,
    }
