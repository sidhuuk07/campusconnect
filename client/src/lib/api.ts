export type Student = { id: string; name: string; email: string; role: "student" | "faculty" | "admin"; registrationDate: string };
export type TaskStatus = "todo" | "in-progress" | "completed";
export type Task = { id: string; title: string; description: string; status: TaskStatus; assignedUser?: string; createdDate: string };
export type AuthSession = { token: string; user: Pick<Student, "id" | "name" | "email" | "role"> };
type ApiResponse<T> = { success: boolean; message?: string; data: T };
const TOKEN_KEY = "campusconnect_token";

export function getToken() { return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY); }
export function saveToken(token: string) { window.localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { window.localStorage.removeItem(TOKEN_KEY); }

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers ?? {}) }, ...options });
  const payload = await response.json().catch(() => ({ success: false, message: "The server returned an invalid response." }));
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Request failed.");
  return payload as ApiResponse<T>;
}

export const api = {
  auth: {
    login: async (body: { email: string; password: string }) => { const response = await request<AuthSession>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }); saveToken(response.data.token); return response; },
    me: () => request<Pick<Student, "id" | "name" | "email" | "role">>("/api/auth/me"),
    logout: () => { clearToken(); },
  },
  students: {
    list: (search = "") => request<Student[]>(`/api/students${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    create: async (body: { name: string; email: string; password: string }) => { const response = await request<AuthSession>("/api/students", { method: "POST", body: JSON.stringify(body) }); saveToken(response.data.token); return response; },
    update: (id: string, body: { name: string; email: string }) => request<Student>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: string) => request<null>(`/api/students/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (filters: { status?: string; owner?: string; createdAfter?: string } = {}) => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]); return request<Task[]>(`/api/tasks${params.size ? `?${params}` : ""}`); },
    create: (body: { title: string; description?: string; status?: TaskStatus; assignedUser?: string }) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Omit<Task, "id" | "createdDate">>) => request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: string) => request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  management: {
    overview: () => request<{ students: Student[]; tasks: Task[]; summary: { students: number; tasks: number; completedTasks: number } }>("/api/management/overview"),
    updateRole: (id: string, role: Student["role"]) => request<Student>(`/api/management/students/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    assignTask: (id: string, assignedUser: string) => request<Task>(`/api/management/tasks/${id}/assignment`, { method: "PUT", body: JSON.stringify({ assignedUser }) }),
  },
};
