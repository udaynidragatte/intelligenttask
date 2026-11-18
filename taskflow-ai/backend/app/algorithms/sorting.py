"""Sorting algorithms implemented manually (no ``sorted`` / ``list.sort``).

Every function receives the task list, the field to sort by and a metrics
object so the API can report comparisons, swaps/moves and execution time.
"""

from __future__ import annotations

import time

PRIORITY_RANK = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}

SORT_FIELDS = {
    "priority": {"label": "Priority", "note": "Critical → Low, ties broken by earliest deadline"},
    "deadline": {"label": "Deadline", "note": "Earliest deadline first, tasks without a deadline last"},
    "duration": {"label": "Duration", "note": "Shortest estimated duration first"},
    "title": {"label": "Task Name", "note": "Alphabetical order A → Z"},
}

SORT_ALGORITHMS = {
    "bubble": {
        "label": "Bubble Sort",
        "best": "O(n)",
        "average": "O(n²)",
        "worst": "O(n²)",
        "space": "O(1)",
        "stable": True,
        "explanation": (
            "Bubble Sort repeatedly walks the array and swaps adjacent tasks that are out of "
            "order. After each pass the largest remaining task bubbles to the end. With the "
            "'no swaps' early exit an already sorted array needs only one pass, which is why "
            "the best case is O(n)."
        ),
    },
    "selection": {
        "label": "Selection Sort",
        "best": "O(n²)",
        "average": "O(n²)",
        "worst": "O(n²)",
        "space": "O(1)",
        "stable": False,
        "explanation": (
            "Selection Sort scans the unsorted part of the array for the smallest task and "
            "swaps it into the next position. It always performs n(n-1)/2 comparisons, so all "
            "cases are O(n²), but it uses at most n-1 swaps."
        ),
    },
    "insertion": {
        "label": "Insertion Sort",
        "best": "O(n)",
        "average": "O(n²)",
        "worst": "O(n²)",
        "space": "O(1)",
        "stable": True,
        "explanation": (
            "Insertion Sort grows a sorted prefix: each new task is shifted left until it sits "
            "in the correct place, like sorting playing cards in your hand. Nearly sorted data "
            "needs very few shifts, giving the O(n) best case."
        ),
    },
    "merge": {
        "label": "Merge Sort",
        "best": "O(n log n)",
        "average": "O(n log n)",
        "worst": "O(n log n)",
        "space": "O(n)",
        "stable": True,
        "explanation": (
            "Merge Sort splits the array in half, recursively sorts both halves and merges the "
            "two sorted halves with a linear merge. The recursion tree has log n levels and each "
            "level costs O(n), so every case is O(n log n). It needs an O(n) temporary array."
        ),
    },
    "quick": {
        "label": "Quick Sort",
        "best": "O(n log n)",
        "average": "O(n log n)",
        "worst": "O(n²)",
        "space": "O(log n)",
        "stable": False,
        "explanation": (
            "Quick Sort chooses a pivot, partitions smaller tasks to its left and larger tasks "
            "to its right, then sorts both partitions recursively (this implementation uses "
            "Lomuto partitioning). Random data splits evenly (O(n log n)); an already sorted "
            "array with a last-element pivot creates n-1 levels, which is the O(n²) worst case."
            " Recursion uses O(log n) stack space."
        ),
    },
}


class SortMetrics:
    """Counters reported by the Sorting Lab."""

    def __init__(self):
        self.comparisons = 0
        self.swaps = 0
        self.moves = 0


# ---------------------------------------------------------------------- #
# Comparison rule
# ---------------------------------------------------------------------- #
def _compare(a: dict, b: dict, field: str) -> int:
    """Return a negative number if *a* should appear before *b*."""

    if field == "priority":
        rank_a = PRIORITY_RANK.get(a.get("priority"), 0)
        rank_b = PRIORITY_RANK.get(b.get("priority"), 0)
        if rank_a != rank_b:
            return -1 if rank_a > rank_b else 1
        # Same priority -> earliest deadline first (a real scheduling rule).
        deadline_a = a.get("deadline") or "9999-12-31"
        deadline_b = b.get("deadline") or "9999-12-31"
        if deadline_a == deadline_b:
            return 0
        return -1 if deadline_a < deadline_b else 1

    if field == "deadline":
        deadline_a = a.get("deadline") or "9999-12-31"
        deadline_b = b.get("deadline") or "9999-12-31"
        if deadline_a == deadline_b:
            return 0
        return -1 if deadline_a < deadline_b else 1

    if field == "duration":
        duration_a = a.get("duration") or 0
        duration_b = b.get("duration") or 0
        if duration_a == duration_b:
            return 0
        return -1 if duration_a < duration_b else 1

    if field == "title":
        title_a = (a.get("title") or "").lower()
        title_b = (b.get("title") or "").lower()
        if title_a == title_b:
            return 0
        return -1 if title_a < title_b else 1

    raise ValueError(f"Unknown sort field: {field}")


# ---------------------------------------------------------------------- #
# O(n²) algorithms
# ---------------------------------------------------------------------- #
def bubble_sort(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    arr = list(tasks)
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            metrics.comparisons += 1
            if _compare(arr[j], arr[j + 1], field) > 0:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                metrics.swaps += 1
                swapped = True
        if not swapped:
            break  # already sorted -> best case O(n)
    return arr


def selection_sort(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    arr = list(tasks)
    n = len(arr)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            metrics.comparisons += 1
            if _compare(arr[j], arr[min_index], field) < 0:
                min_index = j
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
            metrics.swaps += 1
    return arr


def insertion_sort(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    arr = list(tasks)
    for i in range(1, len(arr)):
        current = arr[i]
        j = i - 1
        while j >= 0:
            metrics.comparisons += 1
            if _compare(arr[j], current, field) > 0:
                arr[j + 1] = arr[j]  # shift right
                metrics.swaps += 1
                j -= 1
            else:
                break
        arr[j + 1] = current
    return arr


# ---------------------------------------------------------------------- #
# Divide and conquer algorithms
# ---------------------------------------------------------------------- #
def _merge(left: list[dict], right: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    merged: list[dict] = []
    i = j = 0
    while i < len(left) and j < len(right):
        metrics.comparisons += 1
        # <= keeps the algorithm stable for equal keys.
        if _compare(left[i], right[j], field) <= 0:
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


def merge_sort(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    if len(tasks) <= 1:
        return list(tasks)
    mid = len(tasks) // 2
    left = merge_sort(tasks[:mid], field, metrics)
    right = merge_sort(tasks[mid:], field, metrics)
    return _merge(left, right, field, metrics)


def _partition(arr: list[dict], low: int, high: int, field: str, metrics: SortMetrics) -> int:
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        metrics.comparisons += 1
        if _compare(arr[j], pivot, field) <= 0:
            i += 1
            if i != j:
                arr[i], arr[j] = arr[j], arr[i]
                metrics.swaps += 1
    if i + 1 != high:
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        metrics.swaps += 1
    return i + 1


def _quick_sort_recursive(arr: list[dict], low: int, high: int, field: str, metrics: SortMetrics) -> None:
    if low < high:
        pivot_index = _partition(arr, low, high, field, metrics)
        _quick_sort_recursive(arr, low, pivot_index - 1, field, metrics)
        _quick_sort_recursive(arr, pivot_index + 1, high, field, metrics)


def quick_sort(tasks: list[dict], field: str, metrics: SortMetrics) -> list[dict]:
    arr = list(tasks)
    _quick_sort_recursive(arr, 0, len(arr) - 1, field, metrics)
    return arr


SORT_FUNCTIONS = {
    "bubble": bubble_sort,
    "selection": selection_sort,
    "insertion": insertion_sort,
    "merge": merge_sort,
    "quick": quick_sort,
}


# ---------------------------------------------------------------------- #
# Public API
# ---------------------------------------------------------------------- #
def sort_tasks(tasks: list[dict], algorithm: str, field: str) -> dict:
    """Run one sorting algorithm and return results + measured metrics."""

    if algorithm not in SORT_FUNCTIONS:
        raise ValueError(
            f"Unknown sorting algorithm '{algorithm}'. Choose one of: {', '.join(SORT_FUNCTIONS)}"
        )
    if field not in SORT_FIELDS:
        raise ValueError(
            f"Unknown sort field '{field}'. Choose one of: {', '.join(SORT_FIELDS)}"
        )

    metrics = SortMetrics()
    started = time.perf_counter()
    result = SORT_FUNCTIONS[algorithm](tasks, field, metrics)
    elapsed_ms = (time.perf_counter() - started) * 1000

    meta = SORT_ALGORITHMS[algorithm]
    return {
        "algorithm": algorithm,
        "label": meta["label"],
        "field": field,
        "field_label": SORT_FIELDS[field]["label"],
        "results": result,
        "metrics": {
            "elements": len(tasks),
            "comparisons": metrics.comparisons,
            "swaps": metrics.swaps,
            "moves": metrics.moves,
            "execution_time_ms": round(elapsed_ms, 4),
        },
        "complexity": {
            "best": meta["best"],
            "average": meta["average"],
            "worst": meta["worst"],
            "space": meta["space"],
            "stable": meta["stable"],
        },
        "explanation": meta["explanation"],
        "note": SORT_FIELDS[field]["note"],
    }
