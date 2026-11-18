import { CheckCircle2, Loader2, Pencil, RotateCcw, Timer, Trash2 } from "lucide-react";

import { PriorityBadge, StatusBadge } from "./ui";
import { deadlineInfo, formatDuration } from "../utils/taskMeta";

export default function TaskTable({ tasks, busyId, onToggleComplete, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
        <p className="text-sm font-semibold text-slate-300">No tasks match these filters</p>
        <p className="mt-1 text-xs text-slate-500">Try clearing the filters or add a new task.</p>
      </div>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[820px] border-separate border-spacing-y-1">
        <thead>
          <tr>
            <th className="th">Task</th>
            <th className="th">Priority</th>
            <th className="th">Status</th>
            <th className="th">Deadline</th>
            <th className="th">Duration</th>
            <th className="th">Category</th>
            <th className="th text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const deadline = deadlineInfo(task);
            const isBusy = busyId === task.id;
            return (
              <tr key={task.id} className="group">
                <td className="td max-w-[320px] rounded-l-xl bg-white/[0.02]">
                  <p className="flex items-center gap-2 font-medium text-white">
                    <span className="text-[10px] font-mono text-slate-500">#{task.id}</span>
                    <span className="truncate">{task.title}</span>
                  </p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{task.description}</p>
                  )}
                </td>
                <td className="td bg-white/[0.02]">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="td bg-white/[0.02]">
                  <StatusBadge status={task.status} />
                </td>
                <td className={`td bg-white/[0.02] text-xs ${deadline.tone}`}>{deadline.text}</td>
                <td className="td bg-white/[0.02]">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Timer size={13} />
                    {formatDuration(task.duration)}
                  </span>
                </td>
                <td className="td bg-white/[0.02] text-xs">
                  <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400">{task.category}</span>
                </td>
                <td className="td rounded-r-xl bg-white/[0.02] text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task)}
                      disabled={isBusy}
                      className={`btn btn-sm ${
                        task.status === "Completed"
                          ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                      title={task.status === "Completed" ? "Reopen task" : "Mark as completed"}
                    >
                      {isBusy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : task.status === "Completed" ? (
                        <RotateCcw size={13} />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      <span className="hidden xl:inline">
                        {task.status === "Completed" ? "Reopen" : "Complete"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="btn btn-sm border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      title="Edit task"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="btn btn-sm btn-danger"
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
