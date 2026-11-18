import { AlertTriangle, CheckCircle2, Inbox, Loader2, X } from "lucide-react";

import { priorityStyles, statusStyles } from "../utils/taskMeta";

const TONES = {
  violet: "text-violet-300 ring-violet-500/30 bg-violet-500/10",
  sky: "text-sky-300 ring-sky-500/30 bg-sky-500/10",
  emerald: "text-emerald-300 ring-emerald-500/30 bg-emerald-500/10",
  amber: "text-amber-300 ring-amber-500/30 bg-amber-500/10",
  rose: "text-rose-300 ring-rose-500/30 bg-rose-500/10",
  fuchsia: "text-fuchsia-300 ring-fuchsia-500/30 bg-fuchsia-500/10",
};

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = "violet" }) {
  return (
    <div className="card card-hover relative overflow-hidden p-5">
      <div
        className={`absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl ${
          tone === "rose" ? "bg-rose-500/20" : tone === "amber" ? "bg-amber-500/15" : "bg-violet-500/20"
        }`}
      />
      <div className="relative">
        <div
          className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${TONES[tone] || TONES.violet}`}
        >
          <Icon size={18} />
        </div>
        <p className="text-3xl font-bold leading-none tracking-tight text-white">{value}</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
      {label}
    </div>
  );
}

export function ErrorAlert({ message, details, onDismiss }) {
  if (!message) return null;
  const detailList = details ? Object.entries(details).filter(([, value]) => value) : [];

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {detailList.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-rose-200/80">
            {detailList.map(([field, text]) => (
              <li key={field}>{text}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-rose-300/70 hover:text-rose-200">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function SuccessAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-emerald-300/70 hover:text-emerald-200">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <Icon className="mb-3 h-7 w-7 text-slate-500" />
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}

export function SectionCard({ title, subtitle, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
              <Icon size={16} />
            </span>
          )}
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`chip ${priorityStyles[priority] || priorityStyles.Medium}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`chip ${statusStyles[status] || statusStyles.Pending}`}>{status}</span>;
}

export function MetricTile({ label, value, suffix, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink/40 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>
        {value}
        {suffix && <span className="ml-1 text-xs font-medium text-slate-500">{suffix}</span>}
      </p>
    </div>
  );
}

export function ComplexityPill({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <code className="text-xs font-semibold text-violet-300">{value}</code>
    </div>
  );
}
