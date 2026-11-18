# TaskFlow AI

**Intelligent Task Scheduling & Priority Management System**

> Organize Smarter. Prioritize Better. Achieve More.

An academic **Data Structures & Algorithms** project (5th semester, CSE) that implements a
real scheduling engine in Python and connects it to a modern React dashboard through REST APIs.
No fake sorting, no hardcoded dashboard numbers, and no "sorted list pretending to be a heap":
arrays, stacks, queues, a binary max-heap, five sorting algorithms and two search algorithms are
all written by hand and actually used by the application.

---

## 1. Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Lucide React icons, Recharts, React Router |
| Backend | Python 3, Flask, REST API, Flask-CORS |
| Database | SQLite + SQLAlchemy ORM (Flask-SQLAlchemy) |
| Data structures | Python lists/arrays, Stack, FIFO Queue, Binary Max-Heap, Priority Queue |
| Algorithms | Bubble, Selection, Insertion, Merge, Quick Sort · Linear & Binary Search |

---

## 2. Features

### Dashboard
Six live statistics (total, pending, completed, high priority, overdue, due today) plus today's
tasks, upcoming deadlines, highest-priority tasks, recently completed tasks, completion statistics,
a priority distribution pie chart and a 7-day productivity bar chart. Everything is aggregated from
SQLite on every request.

### Task management
Full CRUD with client + server validation, deadlines, duration, priority, category, description and
status. Complete / reopen tasks, confirm before deleting, and every mutation rebuilds the priority
heap automatically.

### Priority Scheduler (binary max-heap)
A genuine array-based max-heap with `insert` (sift-up), `extract_max` (sift-down), `peek`,
`update`, `remove` and O(n) bottom-up `rebuild`. The page visualises the heap level by level, shows
the backing array, the extraction order, a step log and comparison/swap counters.

Priority rule: **Critical › High › Medium › Low**, ties broken by the **earliest deadline**
(and finally by task id for deterministic ordering).

### Queue Manager (FIFO)
`ArrayQueue` built on a Python list with a front index, so enqueue/dequeue are O(1) amortized.
Add tasks, process the front task, remove any queued task, and see positions, front/back labels and
arrows between cards.

### Stack Manager (LIFO + undo)
Completed tasks are pushed onto a list-backed stack. **Pop** reopens the most recently completed
task — a working undo feature with TOP/BOTTOM indicators and a peek card.

### Sorting Lab
Bubble, Selection, Insertion, Merge and Quick Sort implemented manually. Sort by priority, deadline,
duration or task name. Each run reports execution time (measured with `time.perf_counter`),
comparisons, swaps, array moves, complexity and an explanation.

### Searching Lab
Linear Search (substring matching for text fields) and Binary Search (exact key). Binary search
first sorts the tasks with Merge Sort on the searched key, then halves the range. Both report
comparisons, timing, complexity and result rows.

### Algorithm Analysis
Complexity table for all algorithms plus operation-level costs for lists, stacks, queues, heaps and
priority queues, with space complexity and real scheduling examples.

### About Project
Title, objective, modules covered, stack, architecture tree, REST API surface and run instructions.

---

## 3. Project structure

```
taskflow-ai/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── sorting.py          # 5 manual sorts + complexity metadata
│   │   │   └── searching.py        # linear + binary search, merge-sort preparation
│   │   ├── data_structures/
│   │   │   ├── priority_queue.py   # BinaryMaxHeap + TaskPriorityQueue
│   │   │   ├── fifo_queue.py       # ArrayQueue (front index)
│   │   │   └── stack.py            # Stack (LIFO)
│   │   ├── models/
│   │   │   └── task.py             # SQLAlchemy Task model
│   │   ├── routes/
│   │   │   ├── tasks.py            # CRUD + complete/reopen
│   │   │   ├── dashboard_routes.py
│   │   │   ├── priority_routes.py
│   │   │   ├── queue_routes.py
│   │   │   ├── stack_routes.py
│   │   │   └── algorithm_routes.py
│   │   ├── services/
│   │   │   ├── scheduler.py        # heap kept in sync with SQLite
│   │   │   ├── dashboard.py        # aggregations
│   │   │   ├── sample_data.py      # 14 realistic sample tasks
│   │   │   └── validators.py       # input validation
│   │   ├── database.py
│   │   ├── main.py
│   │   └── __init__.py             # app factory, CORS, error handlers
│   ├── requirements.txt
│   ├── run.py
│   └── taskflow.db                 # created automatically
├── frontend/
│   ├── src/
│   │   ├── components/             # Layout, TaskForm, TaskTable, ConfirmDialog, UI kit
│   │   ├── pages/                  # 10 pages
│   │   ├── services/api.js         # fetch wrapper for every endpoint
│   │   ├── hooks/useTasks.js
│   │   ├── utils/taskMeta.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

The separation is deliberate: **algorithms** know nothing about Flask, **routes** contain no
algorithm code, and **models** only describe the database.

---

## 4. How to run (VS Code PowerShell)

### Terminal 1 — backend (http://localhost:5000)

```powershell
cd taskflow-ai\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

If PowerShell blocks the activation script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

You can also skip activation and call the interpreter directly:

```powershell
.\.venv\Scripts\python.exe run.py
```

The first start creates `backend\taskflow.db`, the `tasks` table and 14 sample tasks. You should see
Flask listening on `http://127.0.0.1:5000`.

### Terminal 2 — frontend (http://localhost:5173)

```powershell
cd taskflow-ai\frontend
npm install
npm run dev
```

Open the printed URL (normally `http://127.0.0.1:5173`).

> **Port note:** if `localhost:5173` does not answer, use `http://127.0.0.1:5173` (Vite is bound to
> 127.0.0.1). The API base URL defaults to `http://localhost:5000/api`; to change it, create
> `frontend\.env` with `VITE_API_URL=http://127.0.0.1:5000/api`.

### Reset the sample data

Stop the backend, delete `backend\taskflow.db`, start it again. The database, sample tasks and heap
are recreated on startup.

---

## 5. Data structures in detail

### Binary max-heap (`data_structures/priority_queue.py`)

Stored in a plain Python list. For index `i`:

- parent = `(i - 1) // 2`
- left child = `2i + 1`
- right child = `2i + 2`

| Operation | Method | Time |
| --- | --- | --- |
| Insert | append + sift-up | O(log n) |
| Peek | `heap[0]` | O(1) |
| Extract max | swap root with last, pop, sift-down | O(log n) |
| Build / rebuild | bottom-up heapify | O(n) |
| Update priority | replace + sift-up/down | O(log n) |
| Remove arbitrary task | replace with last + restore | O(log n) + O(n) search |
| Space | array of n items | O(n) |

Comparison rule: higher `priority_rank` wins; equal ranks compare ISO deadline strings, so the
earlier deadline wins; equal deadlines fall back to the smaller id.

### FIFO queue (`data_structures/fifo_queue.py`)

`ArrayQueue` keeps `items` and a `front` index. Dequeue advances the index instead of shifting the
list, so both operations are O(1) amortized; the list is compacted occasionally. Queue membership
is persisted in SQLite through `Task.queue_position`, so the queue survives a page refresh and a
backend restart.

### Stack (`data_structures/stack.py`)

Thin LIFO wrapper over a Python list: `push` appends, `pop` removes the last element, `peek` reads
it. The completion stack is derived from completed tasks ordered by `completed_at`; popping reopens
the most recent task (status `Pending`, `completed_at = NULL`).

---

## 6. Algorithms in detail

### Sorting (`algorithms/sorting.py`)

All five algorithms are handwritten — no `sorted()` or `list.sort()`.

| Algorithm | Best | Average | Worst | Space | Stable |
| --- | --- | --- | --- | --- | --- |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |

Bubble Sort exits early when a pass makes no swaps (best case O(n)). Quick Sort uses Lomuto
partitioning. Merge Sort keeps equal keys stable with `<=` during the merge.

### Searching (`algorithms/searching.py`)

- **Linear Search** — checks each task; supports partial text matching; O(n).
- **Binary Search** — requires ascending data on the searched key. The module sorts the tasks with
  its own Merge Sort in ascending key order, then performs the classic `low/high/mid` loop and
  expands around the hit to collect duplicates; O(log n).

`POST /api/sort` and `GET /api/search` measure wall-clock time with `time.perf_counter()` and return
the real comparison counts.

---

## 7. REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Service check |
| POST | `/tasks` | Create task |
| GET | `/tasks` | List tasks (`?status=&priority=&category=`) |
| GET | `/tasks/{id}` | Get one task |
| PUT | `/tasks/{id}` | Update task (partial body allowed) |
| DELETE | `/tasks/{id}` | Delete task |
| PATCH | `/tasks/{id}/complete` | `{"completed": true/false}` or toggle |
| GET | `/dashboard/stats` | All dashboard data |
| GET | `/priority-queue` | Heap array + tree metadata + ordered list + steps |
| POST | `/priority-queue/insert` | `{"task_id": 4}` insert with sift-up |
| POST | `/priority-queue/process` | Extract max; task becomes In Progress |
| POST | `/priority-queue/rebuild` | Bottom-up heapify from pending tasks |
| GET | `/queue` | FIFO queue view |
| POST | `/queue/enqueue` | `{"task_id": 4}` append |
| POST | `/queue/dequeue` | Process the front task |
| POST | `/queue/remove` | Remove a queued task |
| GET | `/stack` | Completion stack (bottom → top) |
| POST | `/stack/push` | `{"task_id": 4}` complete + push |
| POST | `/stack/pop` | Undo the most recent completion |
| POST | `/sort` | `{"algorithm": "merge", "field": "priority"}` |
| GET | `/search` | `?algorithm=binary&field=title&query=Python` |
| GET | `/algorithms` | Catalog of algorithm metadata |

Errors return a JSON body with an `error` message and, for validation failures, a `details` object
keyed by field. Status codes: `200`, `201`, `400`, `404`, `409`, `500`.

---

## 8. Sample data

On first start the backend inserts 14 realistic tasks covering all four priorities, all three
statuses, overdue / due today / upcoming deadlines, several categories (Academics, Exams, Projects,
Practice, Work, Personal, Research) and completion timestamps across the past week so the weekly
chart has data. Two pending tasks are pre-enqueued so the FIFO page is not empty.

---

## 9. Suggested demo flow (for the viva)

1. **Dashboard** — point out that every card is computed from SQLite; compare the counts with
   *All Tasks*.
2. **Add a Critical task due tomorrow** — show validation errors with a bad deadline, then save.
   Return to the dashboard and show the counters change.
3. **Priority Scheduler** — show the heap tree, the array representation, press *Peek*, then
   *Process highest*. Explain sift-down. Use *Insert* to put the In-Progress task back (sift-up).
4. **Queue Manager** — enqueue a task and show it appears at the back with an arrow; *Process next*
   removes the front and moves it to In Progress.
5. **Stack Manager** — complete a task, show it on top; press *Undo last completion* to reopen it.
6. **Sorting Lab** — run Merge Sort by priority, then Bubble Sort by priority. Compare comparison
   counts and note both produce the same order.
7. **Searching Lab** — linear search for `python`, then binary search for
   `Complete Python Assignment` on task name. Show the Merge Sort preparation note and explain why
   binary search cannot find substrings.
8. **Algorithm Analysis** — finish on the complexity table and the heap/queue/stack operation costs.

---

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| “Cannot reach the backend” | Start `python run.py` in `backend`, check port 5000 |
| Page loads but API fails in the browser | Use `http://127.0.0.1:5173` and/or set `VITE_API_URL` |
| `python` not recognised | Install Python 3.10+ and tick “Add Python to PATH” |
| `Activate.ps1 cannot be loaded` | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| Changes to the database schema do not appear | Delete `backend\taskflow.db` and restart (tables are recreated) |
| Port 5000 already in use | Stop the other process or change the port in `run.py` |
| npm install warnings | Warnings are fine; make sure `npm run dev` starts on 5173 |

---

## 11. Academic notes

- **Time complexity** describes growth, not exact seconds; the measured times include Python and
  JSON overhead, which is why small arrays sometimes report very similar durations.
- **Heaps are not sorted arrays.** Only the root is guaranteed to be the maximum; the sorted order
  shown in the UI comes from repeated extraction on a copy.
- **The dashboard is never hardcoded.** It is one SQL-backed aggregation endpoint, and all mutation
  endpoints call `scheduler.sync()` so the heap cannot drift from the database.
- **Every button is wired.** Sort, search, insert, process, enqueue, dequeue, push, pop, peek,
  rebuild, complete, reopen, edit and delete all call real APIs and handle loading/error states.
