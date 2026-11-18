import {
  ArrowDown,
  Clock,
  History,
  Loader2,
  RotateCcw,
  Undo2,
  ArrowUp,
  Layers,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EmptyState,
  ErrorAlert,
  MetricTile,
  PageHeader,
  PriorityBadge,
  SectionCard,
  Spinner,
  SuccessAlert,
} from "../components/ui";
import { api } from "../services/api";
import { formatDateTime } from "../utils/taskMeta";

export default function StackManager() {
  const [stack, setStack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [popped, setPopped] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stackData, taskList] = await Promise.all([api.stack.get(), api.tasks.list()]);
      setStack(stackData);
      setTasks(taskList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const candidates = useMemo(() => tasks.filter((task) => task.status !== "Completed"), [tasks]);

  async function run(key, action, successMessage) {
    setBusy(key);
    setError("");
    setFlash("");
    try {
      const response = await action();
      if (response.items) setStack(response);
      if (response.popped) setPopped(response.popped);
      setFlash(successMessage || response.message || "Done");
      const fresh = await api.tasks.list();
      setTasks(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function handlePush() {
    if (!selected) {
      setError("Choose a task to complete and push onto the stack");
      return;
    }
    run(
      "push",
      () => api.stack.push(Number(selected)),
      "Task completed and pushed onto the top of the stack"
    ).then(() => setSelected(""));
  }

  const topFirst = stack ? [...stack.items].reverse() : [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Data structure · LIFO stack"
        title="Stack Manager"
        description="Completed tasks are pushed onto a list-backed stack. “Pop” reopens the most recently completed task — a genuine undo feature driven by LIFO order."
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              run("pop", api.stack.pop, "Undo complete — the most recent completion was reverted")
            }
            disabled={Boolean(busy) || loading || !stack || stack.count === 0}
          >
            {busy === "pop" ? <Loader2 size={16} className="animate-spin" /> : <Undo2 size={16} />}
            Undo last completion
          </button>
        }
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />
      <SuccessAlert message={flash} onDismiss={() => setFlash("")} />

      {popped && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Popped</span>
          <span className="text-sm font-semibold text-white">{popped.title}</span>
          <PriorityBadge priority={popped.priority} />
          <span className="text-xs text-slate-400">→ reopened as {popped.status}</span>
          <button
            type="button"
            onClick={() => setPopped(null)}
            className="ml-auto text-[11px] text-slate-400 hover:text-slate-200"
          >
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <Spinner label="Reading the completion stack…" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr,380px]">
            <SectionCard
              title="Completion stack"
              subtitle="Top → bottom · most recent completion first"
              icon={Layers}
            >
              {topFirst.length === 0 ? (
                <EmptyState
                  title="The stack is empty"
                  description="Complete a task (from All Tasks or the panel on the right) and it will land on top of this stack."
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                    <ArrowDown size={12} className="rotate-180" />
                    Top
                  </div>
                  {topFirst.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                        index === 0
                          ? "border-violet-400/40 bg-violet-500/[0.09] shadow-lg shadow-violet-950/30"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[10px] text-slate-400">
                        {item.position}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-sm font-medium text-slate-100">
                          {item.title}
                          {index === 0 && (
                            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-200">
                              top
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {formatDateTime(item.completed_at)}
                          </span>
                          <span>·</span>
                          <span>{item.category}</span>
                        </p>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    <ArrowDown size={12} />
                    Bottom
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <MetricTile label="Stack size" value={stack?.count ?? 0} />
                <MetricTile label="Top task" value={stack?.top ? `#${stack.top.id}` : "—"} />
                <MetricTile label="Order" value="LIFO" />
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Peek · O(1)" subtitle="The element a pop would return" icon={ArrowUp}>
                {stack?.top ? (
                  <div>
                    <p className="text-sm font-semibold text-white">{stack.top.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={stack.top.priority} />
                      <span className="text-[11px] text-slate-500">
                        completed {formatDateTime(stack.top.completed_at)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Nothing to peek — the stack is empty.</p>
                )}
              </SectionCard>

              <SectionCard title="Push a completed task" subtitle="Marks it complete, then pushes · O(1)" icon={RotateCcw}>
                <label className="label" htmlFor="stack-task">
                  Task to complete
                </label>
                <select
                  id="stack-task"
                  className="input"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                >
                  <option value="">Choose a task…</option>
                  {candidates.map((task) => (
                    <option key={task.id} value={task.id}>
                      #{task.id} · {task.title} ({task.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary mt-3 w-full"
                  onClick={handlePush}
                  disabled={Boolean(busy) || candidates.length === 0}
                >
                  {busy === "push" ? <Loader2 size={15} className="animate-spin" /> : <History size={15} />}
                  Complete &amp; push
                </button>
                {candidates.length === 0 && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Every task is completed. Reopen one to push it again.
                  </p>
                )}
              </SectionCard>

              <div className="card border-amber-500/20 bg-amber-500/[0.04]">
                <p className="text-sm font-semibold text-amber-200">Undo semantics</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Popping does not delete anything: the task's status returns to{" "}
                  <span className="text-slate-200">Pending</span> and its completion timestamp is
                  cleared. This is exactly how an editor's “undo” stack behaves.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
