import { Filter, ListTodo, PlusCircle, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ConfirmDialog from "../components/ConfirmDialog";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import { ErrorAlert, PageHeader, Spinner, SuccessAlert } from "../components/ui";
import { useTasks } from "../hooks/useTasks";
import { api } from "../services/api";
import { PRIORITIES, STATUSES } from "../utils/taskMeta";

export default function AllTasks() {
  const { tasks, loading, error, reload } = useTasks();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState(location.state?.message || "");
  const [actionError, setActionError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // A task created on the Add Task page sends a success message through router state.
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !needle ||
        [task.title, task.description, task.category, task.priority]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesStatus = status === "All" || task.status === status;
      const matchesPriority = priority === "All" || task.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, status, priority]);

  async function handleToggle(task) {
    setBusyId(task.id);
    setActionError("");
    try {
      const response = await api.tasks.setCompleted(task.id, task.status !== "Completed");
      setFlash(response.message);
      await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(payload) {
    await api.tasks.update(editing.id, payload);
    setEditing(null);
    setFlash(`Task "${payload.title}" updated`);
    await reload();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setActionError("");
    try {
      const response = await api.tasks.remove(deleting.id);
      setDeleting(null);
      setFlash(response.message);
      await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  const openCount = tasks.filter((task) => task.status !== "Completed").length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Task management"
        title="All Tasks"
        description="Create, edit, complete, reopen and delete tasks. Every change is persisted in SQLite and immediately rebuilds the priority heap."
        actions={
          <Link to="/tasks/new" className="btn btn-primary">
            <PlusCircle size={16} />
            Add new task
          </Link>
        }
      />

      <ErrorAlert message={error || actionError} onDismiss={() => setActionError("")} />
      <SuccessAlert message={flash} onDismiss={() => setFlash("")} />

      <div className="card">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {tasks.length} total
            </span>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-amber-300">
              {openCount} open
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
              {tasks.length - openCount} completed
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-9 sm:w-64"
                placeholder="Search title, category…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select className="input sm:w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All status</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                className="input sm:w-36"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="All">All priority</option>
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
          <Filter size={12} />
          Showing {filtered.length} of {tasks.length} tasks
        </div>

        {loading ? (
          <Spinner label="Loading tasks from the API…" />
        ) : (
          <TaskTable
            tasks={filtered}
            busyId={busyId}
            onToggleComplete={handleToggle}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}

        {!loading && tasks.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">
            The database is empty.{" "}
            <Link to="/tasks/new" className="link">
              Create the first task
            </Link>
            .
          </p>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
          <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-2xl animate-fade-up rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit task #{editing.id}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Updating priority or deadline rebuilds the binary heap automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close editor"
              >
                <X size={18} />
              </button>
            </div>
            <TaskForm
              initialTask={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              submitLabel="Update task"
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete "${deleting?.title || ""}"?`}
        description="This permanently removes the task from SQLite, the priority heap and the execution queue. This action cannot be undone."
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      {!loading && tasks.length > 0 && filtered.length === 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Trash2 size={13} />
          No rows to show — adjust the filters above.
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-600">
          <ListTodo size={12} />
          Completing a task pushes it onto the undo stack; reopening it pops the completion.
        </p>
      )}
    </div>
  );
}
