import {
  ArrowRight,
  Binary,
  Flame,
  ListTree,
  Layers,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Eye,
  Terminal,
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
import { formatDate } from "../utils/taskMeta";

function HeapNode({ node }) {
  const isRoot = node.index === 0;
  return (
    <div
      className={`w-40 shrink-0 rounded-xl border p-3 transition ${
        isRoot
          ? "border-violet-400/50 bg-violet-500/10 shadow-lg shadow-violet-950/40 ring-1 ring-violet-400/30"
          : "border-white/10 bg-white/[0.03] hover:border-violet-400/30"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>[{node.index}]</span>
        {isRoot && <span className="font-sans font-semibold text-violet-300">max</span>}
      </div>
      <p className="mt-1 line-clamp-2 min-h-[32px] text-xs font-semibold leading-snug text-slate-100">
        {node.title}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <PriorityBadge priority={node.priority} />
        <span className="text-[10px] text-slate-500">
          {node.deadline ? formatDate(node.deadline).slice(0, 6) : "—"}
        </span>
      </div>
    </div>
  );
}

export default function PriorityScheduler() {
  const [pq, setPq] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [processed, setProcessed] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [queueData, taskList] = await Promise.all([api.priorityQueue.get(), api.tasks.list()]);
      setPq(queueData);
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

  const levels = useMemo(() => {
    if (!pq) return [];
    const grouped = [];
    pq.heap.forEach((node) => {
      if (!grouped[node.level]) grouped[node.level] = [];
      grouped[node.level].push(node);
    });
    return grouped;
  }, [pq]);

  const heapIds = useMemo(() => new Set(pq?.heap.map((node) => node.id) || []), [pq]);

  const insertable = tasks.filter(
    (task) => task.status !== "Completed" && !heapIds.has(task.id)
  );

  async function runAction(key, action, message) {
    setBusy(key);
    setError("");
    setFlash("");
    try {
      const response = await action();
      if (response.heap) setPq(response);
      if (response.processed) setProcessed(response.processed);
      setFlash(message || response.message || "Done");
      const freshTasks = await api.tasks.list();
      setTasks(freshTasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handlePeek() {
    setBusy("peek");
    setError("");
    try {
      const response = await api.priorityQueue.get();
      setPq(response);
      setFlash(
        response.peek
          ? `Peek → "${response.peek.title}" (${response.peek.priority}) is the highest-priority task`
          : "The priority queue is empty"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Data structure · Binary max-heap"
        title="Priority Scheduler"
        description="A genuine array-based binary heap. Insertion sifts up, extraction sifts down, and a rebuild uses O(n) bottom-up heapify. Priority wins first; the earliest deadline breaks ties."
        actions={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handlePeek}
              disabled={Boolean(busy) || loading}
            >
              <Eye size={16} />
              Peek
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => runAction("rebuild", api.priorityQueue.rebuild, "Heap rebuilt from pending tasks")}
              disabled={Boolean(busy) || loading}
            >
              <RefreshCw size={16} className={busy === "rebuild" ? "animate-spin" : ""} />
              Rebuild heap
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                runAction("process", api.priorityQueue.process, "Highest-priority task processed")
              }
              disabled={Boolean(busy) || loading || (pq && pq.size === 0)}
            >
              {busy === "process" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Process highest
            </button>
          </>
        }
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />
      <SuccessAlert message={flash} onDismiss={() => setFlash("")} />

      {processed && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.08] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            Processed
          </span>
          <span className="text-sm font-semibold text-white">{processed.title}</span>
          <PriorityBadge priority={processed.priority} />
          <span className="text-xs text-slate-400">→ status changed to In Progress</span>
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
        <Spinner label="Rebuilding the heap from SQLite…" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
            <div className="space-y-6">
              <SectionCard
                title="Heap tree"
                subtitle={`${pq?.size || 0} pending tasks · array indices shown on every node`}
                icon={Layers}
              >
                {pq && pq.size === 0 ? (
                  <EmptyState
                    title="The heap is empty"
                    description="Every pending task has been processed. Reopen a task or add a new one to feed the scheduler."
                  />
                ) : (
                  <div className="space-y-6">
                    {levels.map((nodes, level) => (
                      <div key={level}>
                        <div className="flex flex-wrap items-stretch justify-center gap-3">
                          {nodes.map((node) => (
                            <HeapNode key={node.id} node={node} />
                          ))}
                        </div>
                        {level < levels.length - 1 && (
                          <div className="mt-4 flex justify-center">
                            <span className="h-5 w-px bg-gradient-to-b from-violet-500/60 to-violet-500/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Array representation"
                subtitle="The heap is stored in a plain Python list — parent of i is (i-1)//2"
                icon={Binary}
              >
                {pq && pq.heap.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pq.heap.map((node) => (
                      <div
                        key={node.id}
                        className="rounded-lg border border-white/10 bg-ink/60 px-2.5 py-1.5 text-[11px] text-slate-300"
                      >
                        <span className="font-mono text-violet-400">[{node.index}]</span>{" "}
                        <span className="text-slate-200">{node.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Nothing stored in the array right now.</p>
                )}
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Peek · O(1)" subtitle="Highest priority right now" icon={Flame}>
                {pq?.peek ? (
                  <div>
                    <p className="text-sm font-semibold text-white">{pq.peek.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={pq.peek.priority} />
                      <span className="text-xs text-slate-400">
                        {pq.peek.deadline ? formatDate(pq.peek.deadline) : "No deadline"}
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                      This is heap[0]. The root always holds the task that should be scheduled next.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Heap is empty.</p>
                )}
              </SectionCard>

              <SectionCard title="Last operation" subtitle="Instrumented heap counters" icon={Terminal}>
                <div className="grid grid-cols-2 gap-2">
                  <MetricTile label="Size" value={pq?.size ?? 0} />
                  <MetricTile label="Operation" value={pq?.operation || "—"} />
                  <MetricTile label="Comparisons" value={pq?.stats?.comparisons ?? 0} />
                  <MetricTile label="Swaps" value={pq?.stats?.swaps ?? 0} />
                </div>
                <div className="mt-4 space-y-1.5">
                  {(pq?.steps || []).slice(-6).map((step, index) => (
                    <p key={`${step}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-slate-500">
                      <span className="text-violet-500">›</span>
                      {step}
                    </p>
                  ))}
                  {(!pq?.steps || pq.steps.length === 0) && (
                    <p className="text-[11px] text-slate-500">No heap steps recorded yet.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Extraction order"
              subtitle="Repeated extract-max on a copy of the heap"
              icon={ListTree}
            >
              {pq && pq.ordered.length > 0 ? (
                <ol className="space-y-2">
                  {pq.ordered.map((task, index) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/10 font-mono text-[10px] font-semibold text-violet-300">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-200">
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <span className="hidden text-[10px] text-slate-500 sm:block">
                        {task.deadline || "—"}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-slate-500">No tasks to extract.</p>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-600">
                Processing repeatedly would follow this exact order — a real heap sort.
              </p>
            </SectionCard>

            <SectionCard
              title="Insert a task"
              subtitle="Only tasks outside the heap are listed"
              icon={Plus}
            >
              {insertable.length === 0 ? (
                <EmptyState
                  title="Every open task is already in the heap"
                  description="Process a task (it becomes In Progress) and it will appear here, ready to be inserted back."
                />
              ) : (
                <div className="space-y-2">
                  {insertable.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-200">{task.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {task.status} · {task.priority} · {task.category}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        disabled={Boolean(busy)}
                        onClick={() =>
                          runAction(
                            `insert-${task.id}`,
                            () => api.priorityQueue.insert(task.id),
                            `"${task.title}" inserted with sift-up`
                          )
                        }
                      >
                        {busy === `insert-${task.id}` ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ArrowRight size={12} />
                        )}
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
                Insert appends at the end of the array and sifts up until the parent is greater —
                O(log n).
              </p>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
