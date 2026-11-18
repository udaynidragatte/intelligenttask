import { ArrowUpDown, BookOpen, Loader2, Play, Timer, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import {
  ComplexityPill,
  EmptyState,
  ErrorAlert,
  MetricTile,
  PageHeader,
  PriorityBadge,
  SectionCard,
  Spinner,
  StatusBadge,
} from "../components/ui";
import { api } from "../services/api";
import { deadlineInfo, formatDuration } from "../utils/taskMeta";

const FALLBACK_ALGORITHMS = ["bubble", "selection", "insertion", "merge", "quick"];
const FALLBACK_FIELDS = ["priority", "deadline", "duration", "title"];

export default function SortingLab() {
  const [catalog, setCatalog] = useState(null);
  const [algorithm, setAlgorithm] = useState("merge");
  const [field, setField] = useState("priority");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .catalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => {
        /* selects fall back to static keys if the catalog fails */
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSort() {
    setLoading(true);
    setError("");
    try {
      const payload = await api.sort(algorithm, field);
      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const algorithms = catalog ? Object.entries(catalog.sorting) : FALLBACK_ALGORITHMS.map((key) => [key, { label: key }]);
  const fields = catalog ? Object.entries(catalog.sort_fields) : FALLBACK_FIELDS.map((key) => [key, { label: key }]);
  const selectedMeta = catalog?.sorting?.[algorithm];

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Algorithm lab · Sorting"
        title="Sorting Lab"
        description="Every algorithm here is handwritten in Python — no sorted() and no list.sort(). Run one against the live task data and compare measured comparisons, swaps and execution time."
        actions={
          <button type="button" className="btn btn-primary" onClick={handleSort} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run sort
          </button>
        }
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="space-y-6">
        <div className="card">
          <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto] md:items-end">
            <div>
              <label className="label" htmlFor="sort-algorithm">
                Sorting algorithm
              </label>
              <select
                id="sort-algorithm"
                className="input"
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value)}
              >
                {algorithms.map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label || key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sort-field">
                Sort tasks by
              </label>
              <select
                id="sort-field"
                className="input"
                value={field}
                onChange={(event) => setField(event.target.value)}
              >
                {fields.map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label || key}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary md:w-40" onClick={handleSort} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {loading ? "Sorting…" : "Sort tasks"}
            </button>
          </div>
          {catalogLoading && <p className="mt-2 text-[11px] text-slate-600">Loading complexity metadata…</p>}
        </div>

        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricTile
                label="Execution time"
                value={result.metrics.execution_time_ms}
                suffix="ms"
                tone="text-violet-300"
              />
              <MetricTile label="Comparisons" value={result.metrics.comparisons} tone="text-sky-300" />
              <MetricTile label="Swaps" value={result.metrics.swaps} tone="text-amber-300" />
              <MetricTile label="Array moves" value={result.metrics.moves} tone="text-emerald-300" />
              <MetricTile label="Elements" value={result.metrics.elements} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
              <SectionCard
                title={`Sorted by ${result.field_label.toLowerCase()}`}
                subtitle={`${result.label} · ${result.note}`}
                icon={ArrowUpDown}
              >
                {result.results.length === 0 ? (
                  <EmptyState title="No tasks in the database" />
                ) : (
                  <div className="-mx-5 overflow-x-auto px-5">
                    <table className="w-full min-w-[680px] border-separate border-spacing-y-1">
                      <thead>
                        <tr>
                          <th className="th w-12">#</th>
                          <th className="th">Task</th>
                          <th className="th">Priority</th>
                          <th className="th">Deadline</th>
                          <th className="th">Duration</th>
                          <th className="th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((task, index) => (
                          <tr key={task.id}>
                            <td className="td rounded-l-xl bg-white/[0.02] font-mono text-xs text-slate-500">
                              {index + 1}
                            </td>
                            <td className="td bg-white/[0.02]">
                              <p className="max-w-[280px] truncate font-medium text-white">{task.title}</p>
                              <p className="text-[10px] text-slate-500">{task.category}</p>
                            </td>
                            <td className="td bg-white/[0.02]">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className={`td bg-white/[0.02] text-xs ${deadlineInfo(task).tone}`}>
                              {deadlineInfo(task).text}
                            </td>
                            <td className="td bg-white/[0.02] text-xs text-slate-400">
                              {formatDuration(task.duration)}
                            </td>
                            <td className="td rounded-r-xl bg-white/[0.02]">
                              <StatusBadge status={task.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              <div className="space-y-6">
                <SectionCard title="Complexity" subtitle={`${result.label} · ${result.complexity.stable ? "stable" : "not stable"}`} icon={Timer}>
                  <div className="space-y-2">
                    <ComplexityPill label="Best" value={result.complexity.best} />
                    <ComplexityPill label="Average" value={result.complexity.average} />
                    <ComplexityPill label="Worst" value={result.complexity.worst} />
                    <ComplexityPill label="Space" value={result.complexity.space} />
                  </div>
                </SectionCard>

                <SectionCard title="How it works" icon={BookOpen}>
                  <p className="text-xs leading-relaxed text-slate-400">{result.explanation}</p>
                  <p className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2 text-[11px] leading-relaxed text-violet-200/90">
                    Data still comes from SQLite. Sorting happens in Python on the API side, then
                    the ordered array is returned to React.
                  </p>
                </SectionCard>
              </div>
            </div>
          </>
        )}

        {!result && !loading && (
          <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
            <SectionCard title="Pick a field and run a sort" subtitle="Results, metrics and complexity appear here" icon={ArrowUpDown}>
              <EmptyState
                title="No sort has been run yet"
                description="Choose one of the five algorithms and a field (priority, deadline, duration or task name), then press “Run sort”."
              />
            </SectionCard>
            <SectionCard title={selectedMeta?.label || "Algorithm"} subtitle="From the backend catalog" icon={BookOpen}>
              {selectedMeta ? (
                <>
                  <div className="space-y-2">
                    <ComplexityPill label="Best" value={selectedMeta.best} />
                    <ComplexityPill label="Average" value={selectedMeta.average} />
                    <ComplexityPill label="Worst" value={selectedMeta.worst} />
                    <ComplexityPill label="Space" value={selectedMeta.space} />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{selectedMeta.explanation}</p>
                </>
              ) : (
                <p className="text-xs text-slate-500">Choose an algorithm to see its analysis.</p>
              )}
            </SectionCard>
          </div>
        )}

        {!result && loading && <Spinner label="Running the handwritten algorithm in Python…" />}
      </div>
    </div>
  );
}
