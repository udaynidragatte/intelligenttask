import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import Layout from "./components/Layout";
import About from "./pages/About";
import AddTask from "./pages/AddTask";
import AlgorithmAnalysis from "./pages/AlgorithmAnalysis";
import AllTasks from "./pages/AllTasks";
import Dashboard from "./pages/Dashboard";
import PriorityScheduler from "./pages/PriorityScheduler";
import QueueManager from "./pages/QueueManager";
import SearchingLab from "./pages/SearchingLab";
import SortingLab from "./pages/SortingLab";
import StackManager from "./pages/StackManager";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="card mx-auto max-w-lg py-14 text-center">
      <p className="text-6xl font-black text-violet-500/40">404</p>
      <h1 className="mt-3 text-xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-400">
        The page you tried to open does not exist in TaskFlow AI.
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/tasks/new" element={<AddTask />} />
          <Route path="/priority" element={<PriorityScheduler />} />
          <Route path="/queue" element={<QueueManager />} />
          <Route path="/stack" element={<StackManager />} />
          <Route path="/sorting" element={<SortingLab />} />
          <Route path="/searching" element={<SearchingLab />} />
          <Route path="/analysis" element={<AlgorithmAnalysis />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
