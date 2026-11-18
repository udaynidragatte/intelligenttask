import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flag,
  Flame,
  Layers,
  ListTodo,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  EmptyState,
  ErrorAlert,
  PageHeader,
  SectionCard,
  Spinner,
  StatCard,
} from "../components/ui";
import { api } from "../services/api";
import {
  PRIORITY_COLORS,
  deadlineInfo,
  formatDate,
  formatDateTime,
  formatDuration,
} from "../utils/taskMeta";

const TOOLTIP_STYLE = {
  backgroundColor: "#0e1628",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: 12,
  color: "#e2e8f0",
};

function MiniTask({ task, meta }) {
  const deadline = deadlineInfo(task);
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 transition hover:border-violet-500/25 hover:bg-white/[0.04]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-100">{task.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
          <span className="rounded bg-white/5 px-1.5 py-0.5">{task.category}</span>
          <span>{formatDuration(task.duration)}</span>
          <span className={meta ? "" : deadline.tone}>{meta || deadline.text}</span>
        </p>
      </div>
      <span
        className="chip shrink-0"
        style={{
          borderColor: `${PRIORITY_COLORS[task.priority]}40`,
          backgroundColor: `${PRIORITY_COLORS[task.priority]}1a`,
          color: PRIORITY_COLORS[task.priority],
        }}
      >
        {task.priority}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .dashboard()
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Overview"
        title="Good to see you — let's clear the queue."
        description="Every number on this page is aggregated live from SQLite, so the dashboard, priority heap, queue and stack always tell the same story."
        actions={
          <>
            <Link to="/priority" className="btn btn-ghost">
              <Layers size={16} />
              Priority heap
            </Link>
            <Link to="/tasks/new" className="btn btn-primary">
              <PlusCircle size={16} />
              Add task
            </Link>
          </>
        }
      />

      <ErrorAlert message={error} />

      {loading && <Spinner label="Aggregating tasks, priorities and deadlines…" />}

      {!loading && data && (
        <div className="space-y-6">
          {/* Stat cards -------------------------------------------------- */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={Layers}
              label="Total tasks"
              value={data.stats.total}
              tone="violet"
              hint={`${data.completion_stats.in_progress} in progress`}
            />
            <StatCard
              icon={Clock}
              label="Pending tasks"
              value={data.stats.pending}
              tone="sky"
              hint="Waiting in the scheduler"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={data.stats.completed}
              tone="emerald"
              hint={`${data.completion_stats.completion_rate}% completion rate`}
            />
            <StatCard
              icon={Flag}
              label="High priority"
              value={data.stats.high_priority}
              tone="fuchsia"
              hint="Critical + High, still open"
            />
            <StatCard
              icon={AlertTriangle}
              label="Overdue"
              value={data.stats.overdue}
              tone="rose"
              hint="Deadline already passed"
            />
            <StatCard
              icon={CalendarDays}
              label="Due today"
              value={data.stats.due_today}
              tone="amber"
              hint="Finish before midnight"
            />
          </div>

          {/* Charts ------------------------------------------------------ */}
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard
              title="Priority distribution"
              subtitle="All tasks grouped by priority"
              icon={Flame}
            >
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.priority_distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {data.priority_distribution.map((entry) => (
                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="Weekly productivity"
              subtitle="Tasks completed over the last 7 days"
              icon={TrendingUp}
              className="lg:col-span-2"
            >
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weekly_productivity} barSize={34}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ fill: "rgba(139,92,246,0.08)" }}
                      formatter={(value) => [`${value} completed`, ""]}
                    />
                    <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
                      {data.weekly_productivity.map((entry) => (
                        <Cell key={entry.date} fill={entry.completed > 0 ? "#8b5cf6" : "#243149"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Completion statistics --------------------------------------- */}
          <SectionCard
            title="Task completion statistics"
            subtitle="Where the workload currently stands"
            icon={ListTodo}
          >
            <div className="grid gap-6 sm:grid-cols-[auto,1fr] sm:items-center">
              <div
                className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#8b5cf6 ${data.completion_stats.completion_rate}%, rgba(255,255,255,0.06) 0)`,
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-panel">
                  <span className="text-2xl font-bold text-white">
                    {data.completion_stats.completion_rate}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">complete</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Pending",
                    value: data.completion_stats.pending,
                    color: "bg-slate-400",
                  },
                  {
                    label: "In progress",
                    value: data.completion_stats.in_progress,
                    color: "bg-cyan-400",
                  },
                  {
                    label: "Completed",
                    value: data.completion_stats.completed,
                    color: "bg-emerald-400",
                  },
                ].map((row) => {
                  const total = data.stats.total || 1;
                  const width = Math.round((row.value / total) * 100);
                  return (
                    <div key={row.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="font-semibold text-slate-200">{row.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-500">
                  {data.stats.completed} of {data.stats.total} tasks finished. Overdue tasks are
                  counted from the database deadline, not from the browser clock.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Lists ------------------------------------------------------- */}
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Today's tasks"
              subtitle="Deadline is today and still open"
              icon={CalendarDays}
              action={
                <Link to="/tasks" className="link inline-flex items-center gap-1 text-xs">
                  View all <ArrowUpRight size={13} />
                </Link>
              }
            >
              <div className="space-y-2">
                {data.today_tasks.length === 0 ? (
                  <EmptyState title="Nothing due today" description="A clear day — use it to get ahead." />
                ) : (
                  data.today_tasks.map((task) => <MiniTask key={task.id} task={task} />)
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Upcoming deadlines"
              subtitle="Next six deadlines in date order"
              icon={Clock}
            >
              <div className="space-y-2">
                {data.upcoming_deadlines.length === 0 ? (
                  <EmptyState title="No upcoming deadlines" description="Add deadlines to schedule tasks." />
                ) : (
                  data.upcoming_deadlines.map((task) => (
                    <MiniTask key={task.id} task={task} meta={formatDate(task.deadline)} />
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Highest priority tasks"
              subtitle="Straight from the priority rule"
              icon={Flag}
              action={
                <Link to="/priority" className="link inline-flex items-center gap-1 text-xs">
                  Open heap <ArrowUpRight size={13} />
                </Link>
              }
            >
              <div className="space-y-2">
                {data.highest_priority.length === 0 ? (
                  <EmptyState title="All clear" description="No open tasks left in the scheduler." />
                ) : (
                  data.highest_priority.map((task) => <MiniTask key={task.id} task={task} />)
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Recently completed"
              subtitle="Most recent completions first"
              icon={CheckCircle2}
            >
              <div className="space-y-2">
                {data.recently_completed.length === 0 ? (
                  <EmptyState
                    title="No completed tasks yet"
                    description="Complete a task and it will appear here and on the stack."
                  />
                ) : (
                  data.recently_completed.map((task) => (
                    <MiniTask key={task.id} task={task} meta={`Done ${formatDateTime(task.completed_at)}`} />
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
