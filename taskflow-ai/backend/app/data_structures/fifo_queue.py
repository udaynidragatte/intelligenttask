"""FIFO Queue implemented with a Python list and a front index.

A front index avoids shifting the whole list on every dequeue, so enqueue and
dequeue are both O(1) amortized.  The internal list is compacted when the front
grows large.  This queue drives the execution queue page.
"""

from __future__ import annotations

from typing import Any


class ArrayQueue:
    def __init__(self, items: list[Any] | None = None):
        self._items: list[Any] = list(items or [])
        self._front = 0

    def enqueue(self, item: Any) -> Any:
        """Join the back of the queue -> O(1) amortized."""

        self._items.append(item)
        return item

    def dequeue(self) -> Any:
        """Remove and return the front element -> O(1) amortized."""

        if self.is_empty():
            raise IndexError("Cannot dequeue from an empty queue")

        item = self._items[self._front]
        self._front += 1
        if self._front > 32 and self._front * 2 >= len(self._items):
            self._items = self._items[self._front :]
            self._front = 0
        return item

    def peek(self) -> Any | None:
        return self._items[self._front] if not self.is_empty() else None

    def remove(self, predicate) -> Any | None:
        """Remove the first matching element (used by "remove from queue")."""

        for offset in range(self._front, len(self._items)):
            if predicate(self._items[offset]):
                item = self._items.pop(offset)
                return item
        return None

    def is_empty(self) -> bool:
        return self._front >= len(self._items)

    def size(self) -> int:
        return len(self._items) - self._front

    def to_list(self) -> list[Any]:
        """Front -> back order for the UI."""

        return self._items[self._front :]
