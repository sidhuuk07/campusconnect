import express from "express";
import { createServer } from "http";
import { afterEach, describe, expect, it } from "vitest";
import { registerRestApi } from "./rest";
import { createToken } from "./auth";

const servers: ReturnType<typeof createServer>[] = [];
async function startApi() {
  const app = express(); app.use(express.json()); registerRestApi(app);
  const server = createServer(app); await new Promise<void>(resolve => server.listen(0, resolve)); servers.push(server);
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Test server did not start"); return `http://127.0.0.1:${address.port}`;
}
async function register(base: string) {
  const response = await fetch(`${base}/api/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Test Student", email: `test-${Date.now()}@example.com`, password: "password123" }) });
  const body = await response.json(); return body.data.token as string;
}
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))); });

describe("CampusConnect REST API", () => {
  it("rejects protected task requests without a token", async () => { const base = await startApi(); const response = await fetch(`${base}/api/tasks`); expect(response.status).toBe(401); expect((await response.json()).message).toContain("Authentication required"); });
  it("reports the configured database mode", async () => { const base = await startApi(); const response = await fetch(`${base}/api/health`); expect(response.status).toBe(200); expect((await response.json()).success).toBe(true); });
  it("supports authenticated task create, update, list, and delete", async () => {
    const base = await startApi(); const token = await register(base); const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const createdResponse = await fetch(`${base}/api/tasks`, { method: "POST", headers, body: JSON.stringify({ title: `Test task ${Date.now()}`, description: "API coverage", assignedUser: "Test Student" }) });
    expect(createdResponse.status).toBe(201); const created = await createdResponse.json(); const id = created.data.id as string;
    const updatedResponse = await fetch(`${base}/api/tasks/${id}`, { method: "PUT", headers, body: JSON.stringify({ status: "completed" }) }); expect(updatedResponse.status).toBe(200); expect((await updatedResponse.json()).data.status).toBe("completed");
    const listResponse = await fetch(`${base}/api/tasks`, { headers }); expect((await listResponse.json()).data.some((task: { id: string }) => task.id === id)).toBe(true);
    const deletedResponse = await fetch(`${base}/api/tasks/${id}`, { method: "DELETE", headers }); expect(deletedResponse.status).toBe(200);
  });
  it("allows faculty management overview but reserves role changes for admins", async () => {
    const base = await startApi();
    const facultyToken = await createToken({ id: "faculty-1", email: "faculty@example.com", name: "Faculty", role: "faculty" });
    const facultyResponse = await fetch(`${base}/api/management/overview`, { headers: { Authorization: `Bearer ${facultyToken}` } });
    expect(facultyResponse.status).toBe(200);
    const roleResponse = await fetch(`${base}/api/management/students/missing/role`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${facultyToken}` }, body: JSON.stringify({ role: "admin" }) });
    expect(roleResponse.status).toBe(403);
  });
});
