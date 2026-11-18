import { useCallback, useEffect, useState } from "react";

import { api } from "../services/api";

/** Loads every task and exposes a reload function for after mutations. */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, setTasks, loading, error, reload: load, setError };
}
