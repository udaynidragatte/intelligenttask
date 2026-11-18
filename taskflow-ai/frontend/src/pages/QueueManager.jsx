import {
  ArrowRight,
  ChevronRight,
  Inbox,
  ListOrdered,
  Loader2,
  Play,
  Plus,
  Timer,
  X,
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
import { deadlineInfo, formatDuration } from "../utils/taskMeta";

export default function QueueManager() {
  const [queue, setQueue] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [processed, setProcessed] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [queueData, taskList] = await Promise.all([api.queue.get(), api.tasks.list()]);
      setQueue(queueData);
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

  const candidates = useMemo(
    () => tasks.filter((task) => task.status !== "Completed" && task.queue_position === null),
    [tasks]
  );

  async function run(key, action, successMessage) {
    setBusy(key);
    setError("");
    setFlash("");
    try {
      const response = await action();
      if (response.items) setQueue(response);
      if (response.processed) setProcessed(response.processed);
      setFlash(successMessage || response.message || "Done");
      const fresh = await api.tasks.list();
      setTasks(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function handleEnqueue() {
    if (!selected) {
      setError("Choose a task to add to the execution queue");
      return;
    }
    run(
      "enqueue",
      () => api.queue.enqueue(Number(selected)),
      "Task enqueued at the back of the FIFO queue"
    ).then(() => setSelected(""));
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Data structure · FIFO queue"
        title="Queue Manager"
        description="First In, First Out execution queue built on a Python list with a front index, so enqueue and dequeue both stay O(1). Add tasks, process the front task, or remove something in the middle."
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => run("reload", api.queue.get, "Queue refreshed")}
            disabled={Boolean(busy) || loading}
          >
            <Timer size={16} />
            Refresh queue
          </button>
        }
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />
      <SuccessAlert message={flash} onDismiss={() => setFlash("")} />

      {processed && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.08] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Dequeued
          </span>
          <span className="text-sm font-semibold text-white">{processed.title}</span>
          <PriorityBadge priority={processed.priority} />
          <span className="text-xs text-slate-400">→ status changed to {processed.status}</span>
          <button
            type="button"
            onClick={() => setProcessed(null)}
            className="ml-auto text-[11px] text-slate-400 hover:text-slate-200"
          >
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <Spinner label="Reading the queue from SQLite…" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
            <SectionCard
              title="Execution queue"
              subtitle="Front → back · arrows show the processing direction"
              icon={ListOrdered}
            >
              {!queue || queue.items.length === 0 ? (
                <EmptyState
                  title="The queue is empty"
                  description="Use the panel on the right to enqueue a pending task and demonstrate enqueue / dequeue."
                />
              ) : (
                <div className="flex items-stretch gap-2 overflow-x-auto pb-3">
                  {queue.items.map((item, index) => (
                    <div key={item.id} className="flex items-stretch gap-2">
                      <div
                        className={`w-56 shrink-0 rounded-xl border p-3.5 ${
                          index === 0
                            ? "border-emerald-400/40 bg-emerald-500/[0.07]"
                            : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                            pos {item.position}
                          </span>
                          <div className="flex items-center gap-1">
                            {index === 0 && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                Front
                              </span>
                            )}
                            {index === queue.items.length - 1 && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                Back
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                run(
                                  `remove-${item.id}`,
                                  () => api.queue.remove(item.id),
                                  `"${item.title}" removed from the queue`
                                )
                              }
                              disabled={Boolean(busy)}
                              className="rounded p-0.5 text-slate-500 hover:bg-white/10 hover:text-rose-300"
                              aria-label={`Remove ${item.title} from queue`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 min-h-[32px] text-xs font-semibold text-slate-100">
                          {item.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <PriorityBadge priority={item.priority} />
                          <span className="text-[10px] text-slate-500">
                            {formatDuration(item.duration)}
                          </span>
                        </div>
                        <p className={`mt-2 text-[10px] ${deadlineInfo(item).tone}`}>
                          {deadlineInfo(item).text}
                        </p>
                      </div>
                      {index < queue.items.length - 1 && (
                        <ChevronRight className="self-center text-slate-600" size={18} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricTile label="In queue" value={queue?.count ?? 0} />
                <MetricTile
                  label="Front"
                  value={queue?.front ? queue.front.id : "—"}
                  suffix={queue?.front ? "task" : ""}
                />
                <MetricTile
                  label="Back"
                  value={queue?.back ? queue.back.id : "—"}
                  suffix={queue?.back ? "task" : ""}
                />
                <MetricTile label="Order" value="FIFO" />
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Enqueue a task" subtitle="Appends at the back · O(1)" icon={Plus}>
                <label className="label" htmlFor="queue-task">
                  Pending or in-progress task
                </label>
                <select
                  id="queue-task"
                  className="input"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                >
                  <option value="">Choose a task…</option>
                  {candidates.map((task) => (
                    <option key={task.id} value={task.id}>
                      #{task.id} · {task.title} ({task.priority})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary mt-3 w-full"
                  onClick={handleEnqueue}
                  disabled={Boolean(busy) || candidates.length === 0}
                >
                  {busy === "enqueue" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  Enqueue
                </button>
                {candidates.length === 0 && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Every open task is already queued. Complete or remove one to free a task.
                  </p>
                )}
              </SectionCard>

              <SectionCard title="Dequeue the front" subtitle="Removes the first task in · O(1)" icon={Play}>
                <p className="mb-3 text-xs leading-relaxed text-slate-400">
                  The task that has waited longest is removed and moved to{" "}
                  <span className="text-cyan-300">In Progress</span>. This is the core FIFO
                  behaviour used by printer queues and CPU schedulers.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() =>
                    run("dequeue", api.queue.dequeue, "Front task dequeued and started")
                  }
                  disabled={Boolean(busy) || !queue || queue.count === 0}
                >
                  {busy === "dequeue" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Play size={15} />
                  )}
                  Process next task
                </button>
              </SectionCard>
            </div>
          </div>

          <SectionCard title="Queue vs priority queue" subtitle="Why TaskFlow AI uses both">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <ListOrdered size={15} />
                  Execution queue · FIFO
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Fair and predictable: the first task enqueued is the first processed. Use it once
                  priorities are decided, to schedule work in arrival order.
                </p>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-violet-200">
                  <ArrowRight size={15} />
                  Priority scheduler · heap
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Urgency-aware: the most critical task is always served first, even if it arrived
                  last. Both views stay synchronised with the same SQLite rows.
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-600">
              <Inbox size={12} />
              Removing a task from the queue only clears its queue position — the task itself stays
              in the database.
            </p>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
