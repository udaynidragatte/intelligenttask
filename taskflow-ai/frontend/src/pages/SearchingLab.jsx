import { BookOpen, Loader2, Search, Timer, Binary, ListFilter } from "lucide-react";
import { useEffect, useState } from "react";

import {
  ComplexityPill,
  EmptyState,
  ErrorAlert,
  MetricTile,
  PageHeader,
  PriorityBadge,
  SectionCard,
  StatusBadge,
} from "../components/ui";
import { api } from "../services/api";
import { deadlineInfo } from "../utils/taskMeta";

export default function SearchingLab() {
  const [catalog, setCatalog] = useState(null);
  const [algorithm, setAlgorithm] = useState("linear");
  const [field, setField] = useState("title");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .catalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      active = false;
    };
  }, []);

  const algorithmMeta = catalog?.searching?.[algorithm];
  const fieldMeta = catalog?.search_fields?.[field];

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Enter a value to search for");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await api.search({ algorithm, field, query: query.trim() });
      setResult(payload);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAlgorithmChange(value) {
    setAlgorithm(value);
    setResult(null);
  }

  function handleFieldChange(value) {
    setField(value);
    setQuery("");
    setResult(null);
  }

  const placeholder =
    field === "id"
      ? "e.g. 3"
      : field === "priority"
        ? "Critical, High, Medium or Low"
        : field === "category"
          ? "e.g. Academics"
          : "e.g. Python";

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Algorithm lab · Searching"
        title="Searching Lab"
        description="Linear Search scans the live task array; Binary Search first sorts it with Merge Sort, then halves the range. Both report comparisons, timing and complexity."
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="space-y-6">
        <form onSubmit={handleSearch} className="card">
          <div className="grid gap-4 lg:grid-cols-[1fr,1fr,1.4fr,auto] lg:items-end">
            <div>
              <label className="label" htmlFor="search-algorithm">
                Search algorithm
              </label>
              <select
                id="search-algorithm"
                className="input"
                value={algorithm}
                onChange={(event) => handleAlgorithmChange(event.target.value)}
              >
                {["linear", "binary"].map((key) => (
                  <option key={key} value={key}>
                    {catalog?.searching?.[key]?.label || key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="search-field">
                Search by
              </label>
              <select
                id="search-field"
                className="input"
                value={field}
                onChange={(event) => handleFieldChange(event.target.value)}
              >
                {["id", "title", "priority", "category"].map((key) => (
                  <option key={key} value={key}>
                    {catalog?.search_fields?.[key]?.label || key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="search-query">
                Search query
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="search-query"
                  className="input pl-9"
                  value={query}
                  placeholder={placeholder}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              {fieldMeta && <p className="mt-1.5 text-[11px] text-slate-500">{fieldMeta.note}</p>}
            </div>

            <button type="submit" className="btn btn-primary lg:w-36" disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
          <div className="space-y-6">
            {result && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricTile
                  label="Execution time"
                  value={result.execution_time_ms}
                  suffix="ms"
                  tone="text-violet-300"
                />
                <MetricTile label="Comparisons" value={result.comparisons} tone="text-sky-300" />
                <MetricTile label="Matches" value={result.matches} tone="text-emerald-300" />
                <MetricTile label="Tasks scanned" value={result.scanned} />
              </div>
            )}

            <SectionCard
              title={result ? `${result.matches} matching task(s)` : "Search results"}
              subtitle={
                result
                  ? `${result.label} · ${result.field_label} · query “${result.query}”`
                  : "Run a search to see matching tasks"
              }
              icon={ListFilter}
            >
              {!result && (
                <EmptyState
                  title="No search has been run yet"
                  description="Pick an algorithm and field, type a query and press Search. The backend counts each comparison it makes."
                />
              )}

              {result && result.results.length === 0 && (
                <EmptyState
                  title="No tasks matched"
                  description={
                    algorithm === "binary"
                      ? "Binary Search only finds exact keys. Check the spelling, or switch to Linear Search for partial text matching."
                      : "Try a different query or field."
                  }
                />
              )}

              {result && result.results.length > 0 && (
                <div className="-mx-5 overflow-x-auto px-5">
                  <table className="w-full min-w-[620px] border-separate border-spacing-y-1">
                    <thead>
                      <tr>
                        <th className="th">Task</th>
                        <th className="th">Category</th>
                        <th className="th">Priority</th>
                        <th className="th">Deadline</th>
                        <th className="th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((task) => (
                        <tr key={task.id}>
                          <td className="td rounded-l-xl bg-white/[0.02]">
                            <p className="max-w-[280px] truncate font-medium text-white">
                              <span className="mr-2 font-mono text-[10px] text-slate-500">#{task.id}</span>
                              {task.title}
                            </p>
                          </td>
                          <td className="td bg-white/[0.02] text-xs">
                            <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400">
                              {task.category}
                            </span>
                          </td>
                          <td className="td bg-white/[0.02]">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className={`td bg-white/[0.02] text-xs ${deadlineInfo(task).tone}`}>
                            {deadlineInfo(task).text}
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

              {result?.preparation && (
                <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.05] px-4 py-3 text-[11px] leading-relaxed text-sky-200/90">
                  <span className="font-semibold">Binary Search precondition:</span> tasks were
                  sorted by {result.preparation.sorted_by} with{" "}
                  {result.preparation.sort_algorithm} first ({result.preparation.sort_comparisons}{" "}
                  comparisons, {result.preparation.sort_time_ms} ms). Binary comparisons measure
                  only the search itself.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Complexity" subtitle={result?.label || algorithmMeta?.label || "Search"} icon={Timer}>
              <div className="space-y-2">
                <ComplexityPill label="Best" value={result?.complexity.best || algorithmMeta?.best || "—"} />
                <ComplexityPill label="Average" value={result?.complexity.average || algorithmMeta?.average || "—"} />
                <ComplexityPill label="Worst" value={result?.complexity.worst || algorithmMeta?.worst || "—"} />
                <ComplexityPill label="Space" value={result?.complexity.space || algorithmMeta?.space || "—"} />
              </div>
            </SectionCard>

            <SectionCard title="How it works" icon={BookOpen}>
              <p className="text-xs leading-relaxed text-slate-400">
                {result?.explanation || algorithmMeta?.explanation || "Choose an algorithm to see how it works."}
              </p>
            </SectionCard>

            <div className="card">
              <p className="text-sm font-semibold text-white">Linear vs Binary</p>
              <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-slate-400">
                <p>
                  <span className="font-semibold text-sky-300">Linear Search</span> works on any
                  array, finds partial matches, and examines up to n tasks. Simple but slow for
                  large data.
                </p>
                <p>
                  <span className="font-semibold text-violet-300">Binary Search</span> needs sorted
                  data, halves the range every step and is dramatically faster for big arrays, but
                  it only finds exact keys.
                </p>
                <p className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  With 1,000 tasks a linear search checks up to 1,000 items while binary search
                  needs at most 10 comparisons.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
              <Binary size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Under the hood</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Linear Search is O(n) because it may inspect every task. Binary Search is O(log n)
                because each comparison discards half of the remaining range. Sorting the array
                costs O(n log n) with Merge Sort, which is why binary search pays off when many
                searches run against the same sorted data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
