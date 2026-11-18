"""Priority queue built on a real array-based binary max-heap.

No ``heapq`` and no sorting shortcuts are used: every insertion performs a
sift-up, every removal performs a sift-down, and building from a list uses the
bottom-up heapify algorithm.  A task with the higher priority rank wins; ties
are broken by the earliest deadline (and finally by the smallest task id).
"""

from __future__ import annotations

from typing import Callable, Iterable


def compare_tasks(a: dict, b: dict) -> int:
    """Return >0 if task *a* has higher scheduling priority than task *b*."""

    rank_a = a.get("priority_rank", 0)
    rank_b = b.get("priority_rank", 0)
    if rank_a != rank_b:
        return 1 if rank_a > rank_b else -1

    # Same priority -> earliest deadline first. Tasks without a deadline sink.
    deadline_a = a.get("deadline") or "9999-12-31"
    deadline_b = b.get("deadline") or "9999-12-31"
    if deadline_a != deadline_b:
        # An earlier deadline is MORE important, so it must compare as higher.
        return 1 if deadline_a < deadline_b else -1

    # Final deterministic tie-breaker so the heap order is stable.
    id_a = a.get("id", 0)
    id_b = b.get("id", 0)
    if id_a == id_b:
        return 0
    return 1 if id_a < id_b else -1


class BinaryMaxHeap:
    """Array-backed binary max-heap with instrumented operations."""

    def __init__(self, compare: Callable[[dict, dict], int] | None = None):
        self._data: list[dict] = []
        self._compare = compare or (lambda a, b: (a > b) - (a < b))
        self.operation = "init"
        self.steps: list[str] = []
        self.comparisons = 0
        self.swaps = 0

    # ------------------------------------------------------------------ #
    # Basic helpers
    # ------------------------------------------------------------------ #
    def __len__(self) -> int:
        return len(self._data)

    def is_empty(self) -> bool:
        return not self._data

    @property
    def items(self) -> list[dict]:
        """Return the internal array (heap order, NOT sorted order)."""

        return list(self._data)

    def _begin(self, operation: str) -> None:
        self.operation = operation
        self.steps = []
        self.comparisons = 0
        self.swaps = 0

    def _higher(self, a: dict, b: dict) -> bool:
        self.comparisons += 1
        return self._compare(a, b) > 0

    def _swap(self, i: int, j: int) -> None:
        self._data[i], self._data[j] = self._data[j], self._data[i]
        self.swaps += 1

    def _sift_up(self, index: int) -> int:
        """Move an element up while it is bigger than its parent."""

        while index > 0:
            parent = (index - 1) // 2
            if self._higher(self._data[index], self._data[parent]):
                self._swap(index, parent)
                self.steps.append(
                    f"Swap index {index} with parent {parent} "
                    f"('{self._data[parent]['title']}' moves up)"
                )
                index = parent
            else:
                self.steps.append(
                    f"Index {index} is not higher than parent {parent}: sift-up stops"
                )
                break
        return index

    def _sift_down(self, index: int, size: int | None = None) -> int:
        """Move an element down while a child is bigger than it."""

        size = len(self._data) if size is None else size
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index

            if left < size and self._higher(self._data[left], self._data[largest]):
                largest = left
            if right < size and self._higher(self._data[right], self._data[largest]):
                largest = right

            if largest == index:
                self.steps.append(f"Index {index} is larger than its children: sift-down stops")
                break

            self._swap(index, largest)
            self.steps.append(f"Swap index {index} with child {largest}")
            index = largest
        return index

    # ------------------------------------------------------------------ #
    # Public heap operations
    # ------------------------------------------------------------------ #
    def insert(self, item: dict) -> dict:
        """Insert one task -> O(log n)."""

        self._begin("insert")
        self._data.append(item)
        self.steps.append(f"Append '{item.get('title')}' at index {len(self._data) - 1}")
        self._sift_up(len(self._data) - 1)
        return item

    def peek(self) -> dict | None:
        """Look at the highest priority task -> O(1)."""

        return self._data[0] if self._data else None

    def extract_max(self) -> dict:
        """Remove and return the highest priority task -> O(log n)."""

        self._begin("extract")
        if not self._data:
            raise IndexError("Priority queue is empty")

        root = self._data[0]
        last = self._data.pop()
        if self._data:
            self._data[0] = last
            self.steps.append("Move last element to the root, then sift down")
            self._sift_down(0)
        else:
            self.steps.append("Heap is now empty")
        return root

    def rebuild(self, items: Iterable[dict]) -> None:
        """Bottom-up heapify in O(n) from an unsorted list."""

        self._begin("build")
        self._data = list(items)
        self.steps.append(f"Heapify {len(self._data)} tasks bottom-up")
        for index in range(len(self._data) // 2 - 1, -1, -1):
            self._sift_down(index)

    # Alias used by the API terminology.
    build_heap = rebuild

    def find_index(self, task_id: int) -> int | None:
        for index, item in enumerate(self._data):
            if item.get("id") == task_id:
                return index
        return None

    def update(self, task_id: int, new_item: dict) -> dict | None:
        """Change a task's priority/deadline and restore the heap property."""

        self._begin("update")
        index = self.find_index(task_id)
        if index is None:
            return None

        self._data[index] = new_item
        self.steps.append(f"Replace index {index} and restore heap order")
        if index > 0 and self._higher(self._data[index], self._data[(index - 1) // 2]):
            self._sift_up(index)
        else:
            self._sift_down(index)
        return new_item

    def remove(self, task_id: int) -> dict | None:
        """Remove an arbitrary task (used when a task is deleted or completed)."""

        self._begin("remove")
        index = self.find_index(task_id)
        if index is None:
            return None

        removed = self._data[index]
        last = self._data.pop()
        if index < len(self._data):
            self._data[index] = last
            self.steps.append(f"Remove index {index}, move the last element there")
            if index > 0 and self._higher(self._data[index], self._data[(index - 1) // 2]):
                self._sift_up(index)
            else:
                self._sift_down(index)
        return removed

    # ------------------------------------------------------------------ #
    # Serialization for the frontend
    # ------------------------------------------------------------------ #
    def to_array(self) -> list[dict]:
        """Return heap nodes with tree metadata for the visualisation."""

        nodes = []
        for index, item in enumerate(self._data):
            parent = (index - 1) // 2 if index > 0 else None
            left = 2 * index + 1 if 2 * index + 1 < len(self._data) else None
            right = 2 * index + 2 if 2 * index + 2 < len(self._data) else None
            nodes.append(
                {
                    **item,
                    "index": index,
                    "level": (index + 1).bit_length() - 1,
                    "parent": parent,
                    "left": left,
                    "right": right,
                }
            )
        return nodes

    def to_sorted(self) -> list[dict]:
        """Simulate repeated extract-max on a copy (does not touch the heap)."""

        clone = BinaryMaxHeap(self._compare)
        clone.rebuild(self._data)
        ordered = []
        while not clone.is_empty():
            ordered.append(clone.extract_max())
        return ordered

    def stats(self) -> dict:
        return {
            "comparisons": self.comparisons,
            "swaps": self.swaps,
            "operation": self.operation,
            "size": len(self._data),
        }


class TaskPriorityQueue:
    """Small wrapper that fixes the comparison rule to task priority."""

    def __init__(self):
        self.heap = BinaryMaxHeap(compare_tasks)

    def __len__(self) -> int:
        return len(self.heap)

    def insert(self, task: dict) -> dict:
        return self.heap.insert(task)

    def peek(self) -> dict | None:
        return self.heap.peek()

    def extract_max(self) -> dict:
        return self.heap.extract_max()

    def rebuild(self, tasks: Iterable[dict]) -> None:
        self.heap.rebuild(tasks)

    def update(self, task_id: int, task: dict) -> dict | None:
        return self.heap.update(task_id, task)

    def remove(self, task_id: int) -> dict | None:
        return self.heap.remove(task_id)

    def contains(self, task_id: int) -> bool:
        return self.heap.find_index(task_id) is not None

    def to_array(self) -> list[dict]:
        return self.heap.to_array()

    def to_sorted(self) -> list[dict]:
        return self.heap.to_sorted()

    def stats(self) -> dict:
        return self.heap.stats()

    @property
    def steps(self) -> list[str]:
        return self.heap.steps

    @property
    def operation(self) -> str:
        return self.heap.operation
