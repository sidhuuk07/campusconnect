export type Student = { id: string; name: string; email: string; registrationDate: string };
export type TaskStatus = "todo" | "in-progress" | "completed";
export type Task = { id: string; title: string; description: string; status: TaskStatus; assignedUser?: string; createdDate: string };

type ApiResponse<T> = { success: boolean; message?: string; data: T };

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) }, ...options });
  const payload = await response.json().catch(() => ({ success: false, message: "The server returned an invalid response." }));
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Request failed.");
  return payload as ApiResponse<T>;
}

export const api = {
  students: {
    list: () => request<Student[]>("/api/students"),
    create: (body: { name: string; email: string; password: string }) => request<Student>("/api/students", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name: string; email: string }) => request<Student>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: string) => request<null>(`/api/students/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => request<Task[]>("/api/tasks"),
    create: (body: { title: string; description?: string; status?: TaskStatus; assignedUser?: string }) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Omit<Task, "id" | "createdDate">>) => request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: string) => request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
};
