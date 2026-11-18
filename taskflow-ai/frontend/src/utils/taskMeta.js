export const PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const STATUSES = ["Pending", "In Progress", "Completed"];

export const PRIORITY_COLORS = {
  Critical: "#fb7185",
  High: "#fbbf24",
  Medium: "#a78bfa",
  Low: "#38bdf8",
};

export const priorityStyles = {
  Critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Medium: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  Low: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export const statusStyles = {
  Pending: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  "In Progress": "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

export function formatDate(iso) {
  if (!iso) return "No deadline";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(minutes) {
  const value = Number(minutes) || 0;
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function deadlineInfo(task) {
  if (!task.deadline) return { text: "No deadline", tone: "text-slate-400" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.deadline.slice(0, 10)}T00:00:00`);
  const diff = Math.round((due - today) / 86400000);

  if (task.status === "Completed") return { text: formatDate(task.deadline), tone: "text-slate-400" };
  if (diff < 0) return { text: `${formatDate(task.deadline)} · ${Math.abs(diff)}d overdue`, tone: "text-rose-300" };
  if (diff === 0) return { text: "Due today", tone: "text-amber-300" };
  if (diff === 1) return { text: "Due tomorrow", tone: "text-amber-200" };
  return { text: formatDate(task.deadline), tone: "text-slate-300" };
}
