import {
  BookOpen,
  Boxes,
  Code2,
  Database,
  Github,
  Layers,
  ListOrdered,
  ListTree,
  Server,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import { PageHeader, SectionCard } from "../components/ui";

const MODULES = [
  "Python Programming",
  "Arrays",
  "Lists",
  "Stacks",
  "Queues",
  "Heaps",
  "Sorting",
  "Searching",
  "Algorithm Design",
  "Complexity Analysis",
];

const STACK = [
  { icon: Code2, title: "Frontend", items: ["React.js", "HTML5 / CSS3", "JavaScript", "Tailwind CSS", "Lucide React", "Recharts", "React Router"] },
  { icon: Server, title: "Backend", items: ["Python 3", "Flask", "REST API", "Flask-CORS"] },
  { icon: Database, title: "Database", items: ["SQLite", "SQLAlchemy ORM", "Flask-SQLAlchemy"] },
  { icon: Boxes, title: "Data structures", items: ["Python list", "Stack", "Array queue", "Binary max-heap", "Priority queue"] },
];

const ENDPOINTS = [
  ["POST", "/api/tasks", "Create a task"],
  ["GET", "/api/tasks", "List tasks (filter by status / priority / category)"],
  ["GET", "/api/tasks/{id}", "Fetch one task"],
  ["PUT", "/api/tasks/{id}", "Update a task"],
  ["DELETE", "/api/tasks/{id}", "Delete a task"],
  ["PATCH", "/api/tasks/{id}/complete", "Complete or reopen a task"],
  ["GET", "/api/dashboard/stats", "Dashboard aggregates"],
  ["GET", "/api/priority-queue", "Heap array, ordered extraction, steps"],
  ["POST", "/api/priority-queue/insert", "Insert into the heap (sift-up)"],
  ["POST", "/api/priority-queue/process", "Extract max (sift-down)"],
  ["POST", "/api/priority-queue/rebuild", "Bottom-up heapify"],
  ["GET", "/api/queue", "FIFO queue view"],
  ["POST", "/api/queue/enqueue", "Append to the queue"],
  ["POST", "/api/queue/dequeue", "Process the front task"],
  ["POST", "/api/queue/remove", "Remove a queued task"],
  ["GET", "/api/stack", "Completion stack"],
  ["POST", "/api/stack/push", "Complete a task and push it"],
  ["POST", "/api/stack/pop", "Undo the last completion"],
  ["POST", "/api/sort", "Run a sorting algorithm"],
  ["GET", "/api/search", "Run a search algorithm"],
];

const STRUCTURE_USAGE = [
  { icon: Layers, name: "Lists / arrays", use: "Task records and the heap's backing array" },
  { icon: ListTree, name: "Max-heap", use: "Priority Scheduler — root is always the most urgent task" },
  { icon: ListOrdered, name: "Queue", use: "FIFO execution queue with real enqueue / dequeue" },
  { icon: BookOpen, name: "Stack", use: "Undo the most recent task completion" },
];

export default function About() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Project information"
        title="About TaskFlow AI"
        description="An academic Data Structures & Algorithms project that implements a real scheduling engine in Python and exposes it to a modern React dashboard."
      />

      <div className="space-y-6">
        <div className="card relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-950/60">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Intelligent Task Scheduling &amp; Priority Management System
            </h2>
            <p className="mt-1 text-sm font-medium text-violet-300">
              “Organize Smarter. Prioritize Better. Achieve More.”
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["5th Semester", "Computer Science Engineering", "Data Structures & Algorithms", "Full-stack"].map(
                (badge) => (
                  <span key={badge} className="chip border-white/10 bg-white/5 text-slate-300">
                    {badge}
                  </span>
                )
              )}
            </div>
            <div className="mt-5 rounded-xl border border-white/5 bg-ink/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Objective
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                To develop an intelligent task management application using Python and fundamental
                data structures and algorithms to organize, schedule, prioritize, search and manage
                tasks efficiently.
              </p>
            </div>
          </div>
        </div>

        <SectionCard title="Modules covered" subtitle="The syllabus behind the application" icon={BookOpen}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {MODULES.map((module) => (
              <div
                key={module}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-center text-xs font-medium text-slate-300"
              >
                {module}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STACK.map((group) => (
            <div key={group.title} className="card">
              <div className="mb-3 flex items-center gap-2">
                <group.icon size={15} className="text-violet-300" />
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-violet-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Project architecture" subtitle="Clean separation of concerns" icon={Terminal}>
            <pre className="overflow-x-auto rounded-xl border border-white/5 bg-ink/60 p-4 font-mono text-[11px] leading-relaxed text-slate-400">
{`taskflow-ai/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── sorting.py
│   │   │   └── searching.py
│   │   ├── data_structures/
│   │   │   ├── priority_queue.py
│   │   │   ├── fifo_queue.py
│   │   │   └── stack.py
│   │   ├── models/task.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── run.py
│   └── taskflow.db  (created on first run)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md`}
            </pre>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Algorithms never import Flask, routes never contain algorithm code, and the database
              layer only knows about tasks. The React app talks to Flask exclusively through JSON
              endpoints.
            </p>
          </SectionCard>

          <SectionCard title="How each structure is used" subtitle="The DSA story of the app" icon={Sparkles}>
            <div className="space-y-2.5">
              {STRUCTURE_USAGE.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
                    <item.icon size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="REST API surface"
          subtitle="All endpoints used by the frontend"
          icon={Server}
          action={<span className="chip border-white/10 bg-white/5 text-slate-400">http://localhost:5000</span>}
        >
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[620px] border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="th w-20">Method</th>
                  <th className="th">Endpoint</th>
                  <th className="th">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map(([method, path, purpose]) => (
                  <tr key={`${method}-${path}`}>
                    <td className="td rounded-l-xl bg-white/[0.02]">
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                          method === "GET"
                            ? "bg-sky-500/10 text-sky-300"
                            : method === "POST"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : method === "DELETE"
                                ? "bg-rose-500/10 text-rose-300"
                                : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {method}
                      </span>
                    </td>
                    <td className="td bg-white/[0.02] font-mono text-[11px] text-slate-300">{path}</td>
                    <td className="td rounded-r-xl bg-white/[0.02] text-xs text-slate-400">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Run it locally" subtitle="Two terminals in VS Code (PowerShell)" icon={Terminal}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-200">Backend · port 5000</p>
              <pre className="overflow-x-auto rounded-xl border border-white/5 bg-ink/60 p-3.5 font-mono text-[11px] leading-relaxed text-slate-400">
{`cd taskflow-ai\\backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python run.py`}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-200">Frontend · port 5173</p>
              <pre className="overflow-x-auto rounded-xl border border-white/5 bg-ink/60 p-3.5 font-mono text-[11px] leading-relaxed text-slate-400">
{`cd taskflow-ai\\frontend
npm install
npm run dev`}
              </pre>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            The SQLite database, sample tasks and heap are created automatically on the first
            backend start. See the project README for the full demonstration script and
            troubleshooting notes.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
