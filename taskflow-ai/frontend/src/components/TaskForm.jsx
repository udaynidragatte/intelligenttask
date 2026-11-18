import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PRIORITIES, STATUSES } from "../utils/taskMeta";

function toFormState(task) {
  return {
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "Medium",
    deadline: task?.deadline ? task.deadline.slice(0, 10) : "",
    duration: task?.duration ?? 60,
    category: task?.category || "",
    status: task?.status || "Pending",
  };
}

export default function TaskForm({ initialTask, onSubmit, onCancel, submitLabel = "Save Task" }) {
  const [form, setForm] = useState(() => toFormState(initialTask));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(toFormState(initialTask));
    setErrors({});
    setMessage("");
  }, [initialTask]);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function validate() {
    const found = {};
    if (form.title.trim().length < 2) found.title = "Enter a title of at least 2 characters";
    if (form.title.trim().length > 160) found.title = "Keep the title under 160 characters";
    if (Number(form.duration) < 1) found.duration = "Duration must be at least 1 minute";
    if (!form.category.trim()) found.category = "Choose or type a category";
    if (form.description.length > 2000) found.description = "Description is too long";
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setMessage("");
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        duration: Number(form.duration),
        deadline: form.deadline || null,
      });
    } catch (error) {
      setMessage(error.message);
      if (error.details) setErrors(error.details);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">
          Task title
        </label>
        <input
          id="title"
          className="input"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Complete Python Assignment"
          maxLength={160}
        />
        {errors.title && <p className="mt-1.5 text-xs text-rose-300">{errors.title}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="input resize-none"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="What exactly needs to be done?"
          maxLength={2000}
        />
        {errors.description && <p className="mt-1.5 text-xs text-rose-300">{errors.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="input"
            value={form.priority}
            onChange={(event) => update("priority", event.target.value)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="deadline">
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            className="input"
            value={form.deadline}
            onChange={(event) => update("deadline", event.target.value)}
          />
          {errors.deadline && <p className="mt-1.5 text-xs text-rose-300">{errors.deadline}</p>}
        </div>

        <div>
          <label className="label" htmlFor="duration">
            Estimated duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min={1}
            max={100000}
            className="input"
            value={form.duration}
            onChange={(event) => update("duration", event.target.value)}
          />
          {errors.duration && <p className="mt-1.5 text-xs text-rose-300">{errors.duration}</p>}
        </div>

        <div>
          <label className="label" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            className="input"
            list="category-options"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            placeholder="Academics, Exams, Work…"
            maxLength={60}
          />
          <datalist id="category-options">
            {["Academics", "Exams", "Projects", "Practice", "Work", "Personal", "Research"].map(
              (category) => (
                <option key={category} value={category} />
              )
            )}
          </datalist>
          {errors.category && <p className="mt-1.5 text-xs text-rose-300">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className="input sm:max-w-xs"
          value={form.status}
          onChange={(event) => update("status", event.target.value)}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1.5 text-xs text-rose-300">{errors.status}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <p className="text-xs text-slate-500">Stored in SQLite and synced to every module.</p>
      </div>
    </form>
  );
}
