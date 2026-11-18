import { BookOpen, Boxes, Clock, Database, Layers, ListOrdered, ListTree, Search } from "lucide-react";

import { PageHeader, SectionCard } from "../components/ui";

const SORTING_ROWS = [
  { name: "Bubble Sort", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "Yes" },
  { name: "Selection Sort", best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "No" },
  { name: "Insertion Sort", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "Yes" },
  { name: "Merge Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: "Yes" },
  { name: "Quick Sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: "No" },
  { name: "Linear Search", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)", stable: "—" },
  { name: "Binary Search", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", stable: "—" },
];

const STRUCTURES = [
  {
    icon: Boxes,
    title: "Arrays & Python lists",
    tone: "border-violet-500/20 bg-violet-500/[0.04]",
    text: "Contiguous storage; the base of every task collection and of the heap array.",
    examples: "Task table rows, heap array, sorting input",
    ops: [
      ["Access by index", "O(1)"],
      ["Insert / delete at end", "O(1) amortized"],
      ["Insert / delete in the middle", "O(n)"],
      ["Linear search", "O(n)"],
      ["Binary search on sorted data", "O(log n)"],
      ["Space", "O(n)"],
    ],
  },
  {
    icon: Layers,
    title: "Stack",
    tone: "border-sky-500/20 bg-sky-500/[0.04]",
    text: "LIFO list-backed structure. Whatever was pushed last is popped first.",
    examples: "Undo stack of completed tasks, function call stack",
    ops: [
      ["Push (append)", "O(1)"],
      ["Pop (remove top)", "O(1)"],
      ["Peek at top", "O(1)"],
      ["Search for an element", "O(n)"],
      ["Space", "O(n)"],
    ],
  },
  {
    icon: ListOrdered,
    title: "Queue",
    tone: "border-emerald-500/20 bg-emerald-500/[0.04]",
    text: "FIFO structure with a front index, so no element shifting is needed.",
    examples: "Task execution queue, printer jobs, CPU scheduling",
    ops: [
      ["Enqueue (back)", "O(1) amortized"],
      ["Dequeue (front)", "O(1) amortized"],
      ["Peek at front", "O(1)"],
      ["Remove a task in the middle", "O(n)"],
      ["Space", "O(n)"],
    ],
  },
  {
    icon: ListTree,
    title: "Binary heap",
    tone: "border-fuchsia-500/20 bg-fuchsia-500/[0.04]",
    text: "Complete binary tree stored in an array: parent of i is (i-1)//2.",
    examples: "Priority scheduler, heap sort, top-k selection",
    ops: [
      ["Insert (append + sift-up)", "O(log n)"],
      ["Peek at max/min", "O(1)"],
      ["Extract root (sift-down)", "O(log n)"],
      ["Build heap from n items", "O(n)"],
      ["Search arbitrary value", "O(n)"],
      ["Space", "O(n)"],
    ],
  },
  {
    icon: Clock,
    title: "Priority queue",
    tone: "border-amber-500/20 bg-amber-500/[0.04]",
    text: "Abstract data type implemented here with the max-heap; highest priority leaves first.",
    examples: "Task scheduling by priority and deadline, Dijkstra, A*",
    ops: [
      ["Insert task", "O(log n)"],
      ["Remove highest priority", "O(log n)"],
      ["Peek highest priority", "O(1)"],
      ["Update priority / deadline", "O(log n)"],
      ["Rebuild after bulk changes", "O(n)"],
      ["Space", "O(n)"],
    ],
  },
  {
    icon: Database,
    title: "Persistence layer",
    tone: "border-white/10 bg-white/[0.03]",
    text: "SQLite + SQLAlchemy ORM; every structure above is rebuilt from these rows.",
    examples: "tasks table, dashboard aggregates, queue_position column",
    ops: [
      ["Primary-key lookup", "O(1) with index"],
      ["Insert / update / delete row", "O(log n) (B-tree index)"],
      ["Full table scan", "O(n)"],
      ["Aggregate statistics", "O(n)"],
      ["Space", "O(n)"],
    ],
  },
];

const EXAMPLES = [
  {
    title: "Why the heap wins here",
    icon: ListTree,
    body: "Picking the most urgent task from an unsorted list costs O(n) every time. Keeping tasks in a max-heap makes insertion O(log n) and extraction O(log n), so a scheduler serving hundreds of tasks stays fast.",
  },
  {
    title: "Why a queue is still needed",
    icon: ListOrdered,
    body: "Priority decides what is most urgent, but fair execution is FIFO. Once tasks are chosen for today, the queue preserves arrival order and guarantees nothing starves indefinitely.",
  },
  {
    title: "Why the stack models undo",
    icon: Layers,
    body: "Completing tasks is naturally reversible in reverse order. A stack gives O(1) undo of the most recent completion — the same idea behind Ctrl+Z and browser history.",
  },
  {
    title: "When binary search pays off",
    icon: Search,
    body: "Binary search costs O(log n) per lookup but requires sorted data. Sorting once with Merge Sort (O(n log n)) is worth it when many searches run against the same task list.",
  },
];

export default function AlgorithmAnalysis() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Theory · Complexity analysis"
        title="Algorithm Analysis"
        description="Time and space complexity for every algorithm and data structure implemented in TaskFlow AI, with the practical scheduling scenario each one solves."
      />

      <div className="space-y-6">
        <SectionCard
          title="Comparison table"
          subtitle="Best, average and worst case time complexity"
          icon={BookOpen}
        >
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="th">Algorithm</th>
                  <th className="th">Best case</th>
                  <th className="th">Average case</th>
                  <th className="th">Worst case</th>
                  <th className="th">Space</th>
                  <th className="th">Stable</th>
                </tr>
              </thead>
              <tbody>
                {SORTING_ROWS.map((row, index) => (
                  <tr key={row.name} className={index === 5 ? "border-t border-white/10" : ""}>
                    <td className="td rounded-l-xl bg-white/[0.02] font-medium text-white">
                      {row.name}
                    </td>
                    <td className="td bg-white/[0.02] font-mono text-xs text-emerald-300">{row.best}</td>
                    <td className="td bg-white/[0.02] font-mono text-xs text-sky-300">{row.average}</td>
                    <td className="td bg-white/[0.02] font-mono text-xs text-rose-300">{row.worst}</td>
                    <td className="td bg-white/[0.02] font-mono text-xs text-slate-400">{row.space}</td>
                    <td className="td rounded-r-xl bg-white/[0.02] text-xs text-slate-400">{row.stable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            n = number of tasks. “Stable” means equal keys keep their original relative order.
            Quick Sort's O(n²) worst case appears with already sorted data and a last-element pivot;
            Merge Sort guarantees O(n log n) at the cost of O(n) extra space.
          </p>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STRUCTURES.map((structure) => (
            <div key={structure.title} className={`card border ${structure.tone}`}>
              <div className="mb-1.5 flex items-center gap-2">
                <structure.icon size={16} className="text-violet-300" />
                <h2 className="text-sm font-semibold text-white">{structure.title}</h2>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{structure.text}</p>

              <div className="mt-4 space-y-1.5">
                {structure.ops.map(([operation, complexity]) => (
                  <div
                    key={operation}
                    className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="text-[11px] text-slate-400">{operation}</span>
                    <code className="shrink-0 text-[11px] font-semibold text-violet-300">
                      {complexity}
                    </code>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-400">In TaskFlow AI:</span>{" "}
                {structure.examples}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Space complexity" subtitle="Beyond the time table" icon={Boxes}>
            <div className="space-y-3 text-xs leading-relaxed text-slate-400">
              <p>
                <span className="font-semibold text-slate-200">In-place sorts</span> (Bubble,
                Selection, Insertion) reuse the input array: O(1) auxiliary space. Selection Sort
                needs only a few variables; Insertion Sort shifts elements inside the same list.
              </p>
              <p>
                <span className="font-semibold text-slate-200">Merge Sort</span> allocates left,
                right and merged arrays, so it needs O(n) extra memory. That is the classic
                time/space trade-off.
              </p>
              <p>
                <span className="font-semibold text-slate-200">Quick Sort</span> is in-place on the
                array but recursion needs O(log n) stack frames on average (O(n) worst case).
              </p>
              <p>
                <span className="font-semibold text-slate-200">Structures</span>: a stack, queue or
                heap storing n tasks each use O(n) memory. The heap adds no pointers because the
                tree lives inside a plain Python list.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Where each structure is used" subtitle="Mapping theory to the app" icon={Database}>
            <div className="space-y-2 text-xs">
              {[
                ["Array / list", "Task storage, sorting input, heap array"],
                ["Stack", "Completion history + undo"],
                ["Queue", "FIFO execution queue page"],
                ["Max-heap", "Priority Scheduler extraction order"],
                ["Priority queue", "Choosing the next task to work on"],
                ["Merge Sort", "Sorted data before binary search"],
                ["Linear / Binary Search", "Searching Lab across live tasks"],
              ].map(([structure, usage]) => (
                <div key={structure} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <span className="font-medium text-slate-200">{structure}</span>
                  <span className="text-right text-[11px] text-slate-400">{usage}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {EXAMPLES.map((example) => (
            <div key={example.title} className="card">
              <div className="mb-2 flex items-center gap-2">
                <example.icon size={15} className="text-violet-300" />
                <h3 className="text-sm font-semibold text-white">{example.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{example.body}</p>
            </div>
          ))}
        </div>

        <div className="card border-violet-500/20 bg-violet-500/[0.05]">
          <h2 className="text-sm font-semibold text-violet-200">Key takeaways for the viva</h2>
          <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-slate-300 md:grid-cols-2">
            <li>• Big-O describes growth, not exact seconds — measured times include Python overhead.</li>
            <li>• A heap is not a sorted array: it only guarantees the root is the maximum.</li>
            <li>• Rebuilding a heap bottom-up costs O(n), not O(n log n).</li>
            <li>• Binary search is only valid on data sorted by the searched key.</li>
            <li>• FIFO and LIFO solve different fairness problems; TaskFlow AI uses both.</li>
            <li>• Python lists are dynamic arrays: index access O(1), middle insert O(n).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
