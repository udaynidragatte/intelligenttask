"""LIFO Stack implemented on top of a Python list.

The stack stores completed tasks and powers the "Undo completion" feature:
the most recently completed task is always on top.
"""

from __future__ import annotations

from typing import Any


class Stack:
    def __init__(self, items: list[Any] | None = None):
        # Bottom of the stack is index 0, top is the last element.
        self._items: list[Any] = list(items or [])

    def push(self, item: Any) -> Any:
        """Add to the top -> O(1) amortized."""

        self._items.append(item)
        return item

    def pop(self) -> Any:
        """Remove and return the top element -> O(1)."""

        if self.is_empty():
            raise IndexError("Cannot pop from an empty stack")
        return self._items.pop()

    def peek(self) -> Any | None:
        """Read the top element without removing it -> O(1)."""

        return self._items[-1] if self._items else None

    def is_empty(self) -> bool:
        return not self._items

    def size(self) -> int:
        return len(self._items)

    def to_list(self) -> list[Any]:
        """Bottom -> top order, matching the visual stack in the UI."""

        return list(self._items)
