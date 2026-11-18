import {
  ArrowUpDown,
  BookOpen,
  GitBranch,
  History,
  Info,
  Layers,
  LayoutDashboard,
  ListOrdered,
  ListTodo,
  Menu,
  PlusCircle,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/tasks", label: "All Tasks", icon: ListTodo, end: true },
      { to: "/tasks/new", label: "Add New Task", icon: PlusCircle },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { to: "/priority", label: "Priority Scheduler", icon: Layers },
      { to: "/queue", label: "Queue Manager", icon: ListOrdered },
      { to: "/stack", label: "Stack Manager", icon: History },
    ],
  },
  {
    label: "Algorithm Labs",
    items: [
      { to: "/sorting", label: "Sorting Lab", icon: ArrowUpDown },
      { to: "/searching", label: "Searching Lab", icon: Search },
      { to: "/analysis", label: "Algorithm Analysis", icon: BookOpen },
    ],
  },
  {
    label: "Project",
    items: [{ to: "/about", label: "About Project", icon: Info }],
  },
];

const TITLES = {
  "/": "Dashboard",
  "/tasks": "All Tasks",
  "/tasks/new": "Add New Task",
  "/priority": "Priority Scheduler",
  "/queue": "Queue Manager",
  "/stack": "Stack Manager",
  "/sorting": "Sorting Lab",
  "/searching": "Searching Lab",
  "/analysis": "Algorithm Analysis",
  "/about": "About Project",
};

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-6">
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-950/60">
          <Zap size={22} className="text-white" fill="currentColor" />
        </span>
        <span>
          <span className="block text-lg font-bold leading-tight tracking-tight text-white">
            TaskFlow AI
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
            Intelligent Scheduling
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  <Icon size={17} />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-300">
            <GitBranch size={13} />
            DSA Mini Project
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            Arrays · Lists · Stacks · Queues · Heaps · Sorting · Searching
          </p>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-600">
          5th Semester · CSE · Data Structures & Algorithms
        </p>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || "TaskFlow AI";

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/5 bg-panel/70 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-panel shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{title}</p>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                Organize Smarter. Prioritize Better. Achieve More.
              </p>
            </div>

            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-400 md:inline-flex">
              <Sparkles size={12} className="text-violet-400" />
              Flask + React
            </span>
            <Link to="/tasks/new" className="btn btn-primary btn-sm sm:px-4 sm:py-2">
              <PlusCircle size={15} />
              <span className="hidden sm:inline">New Task</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
          <footer className="mt-12 border-t border-white/5 pt-5 text-[11px] text-slate-600">
            TaskFlow AI · Intelligent Task Scheduling &amp; Priority Management System · Python ·
            Flask · SQLite · React
          </footer>
        </main>
      </div>
    </div>
  );
}
