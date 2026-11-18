const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Cannot reach the backend. Start it with `python run.py` inside the backend folder."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      (data && data.error) || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.details = (data && data.details) || null;
    throw error;
  }

  return data;
}

const json = (body) => JSON.stringify(body);

export const api = {
  health: () => request("/health"),

  tasks: {
    list: () => request("/tasks"),
    get: (id) => request(`/tasks/${id}`),
    create: (payload) => request("/tasks", { method: "POST", body: json(payload) }),
    update: (id, payload) => request(`/tasks/${id}`, { method: "PUT", body: json(payload) }),
    remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
    setCompleted: (id, completed) =>
      request(`/tasks/${id}/complete`, { method: "PATCH", body: json({ completed }) }),
  },

  dashboard: () => request("/dashboard/stats"),

  priorityQueue: {
    get: () => request("/priority-queue"),
    insert: (taskId) =>
      request("/priority-queue/insert", { method: "POST", body: json({ task_id: taskId }) }),
    process: () => request("/priority-queue/process", { method: "POST", body: json({}) }),
    rebuild: () => request("/priority-queue/rebuild", { method: "POST", body: json({}) }),
  },

  queue: {
    get: () => request("/queue"),
    enqueue: (taskId) => request("/queue/enqueue", { method: "POST", body: json({ task_id: taskId }) }),
    dequeue: () => request("/queue/dequeue", { method: "POST", body: json({}) }),
    remove: (taskId) => request("/queue/remove", { method: "POST", body: json({ task_id: taskId }) }),
  },

  stack: {
    get: () => request("/stack"),
    push: (taskId) => request("/stack/push", { method: "POST", body: json({ task_id: taskId }) }),
    pop: () => request("/stack/pop", { method: "POST", body: json({}) }),
  },

  sort: (algorithm, field) =>
    request("/sort", { method: "POST", body: json({ algorithm, field }) }),

  search: ({ algorithm, field, query }) =>
    request(`/search?${new URLSearchParams({ algorithm, field, query }).toString()}`),

  catalog: () => request("/algorithms"),
};

export { BASE_URL };
