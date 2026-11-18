import { ArrowLeft, Lightbulb, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import TaskForm from "../components/TaskForm";
import { PageHeader } from "../components/ui";
import { api } from "../services/api";

export default function AddTask() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const task = await api.tasks.create(payload);
    navigate("/tasks", {
      state: { message: `Task "${task.title}" created and inserted into the priority queue` },
      replace: false,
    });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Task management"
        title="Add New Task"
        description="A complete task record: title, description, priority, deadline, duration, category and status. The API validates every field before saving."
        actions={
          <Link to="/tasks" className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to tasks
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
        <div className="card">
          <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
              <PlusCircle size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Task details</h2>
              <p className="text-xs text-slate-500">
                Fields marked in the form are validated on the client and on the server.
              </p>
            </div>
          </div>
          <TaskForm onSubmit={handleCreate} submitLabel="Create task" />
        </div>

        <aside className="space-y-4">
          <div className="card border-violet-500/20 bg-violet-500/[0.06]">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-200">
              <Lightbulb size={16} />
              How priority works
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-400">
              <li>
                <span className="font-semibold text-slate-200">Critical › High › Medium › Low</span>{" "}
                decides the order inside the binary max-heap.
              </li>
              <li>Equal priorities are ordered by the earliest deadline.</li>
              <li>
                A new task joins the heap automatically after it is saved — no manual refresh
                needed.
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-white">Good task hygiene</h3>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-400">
              <li>• Use a short, action-oriented title.</li>
              <li>• Estimate realistic minutes — the Sorting Lab sorts by duration.</li>
              <li>• Set a deadline so overdue and “due today” counters work.</li>
              <li>• Reuse categories to make search and filtering useful.</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-white">What happens next</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              The task is stored in SQLite through SQLAlchemy, then the scheduler performs an
              O(n) heap rebuild. It appears on the dashboard, the Priority Scheduler, the Queue
              Manager (when enqueued) and both algorithm labs.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
