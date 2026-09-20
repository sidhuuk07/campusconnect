import express from "express";
import { createServer } from "http";
import { afterEach, describe, expect, it } from "vitest";
import { registerRestApi } from "./rest";

const servers: ReturnType<typeof createServer>[] = [];
async function startApi() {
  const app = express();
  app.use(express.json());
  registerRestApi(app);
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, resolve));
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start");
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))); });

describe("CampusConnect REST API", () => {
  it("reports the configured database mode", async () => {
    const base = await startApi();
    const response = await fetch(`${base}/api/health`);
    expect(response.status).toBe(200);
    expect((await response.json()).success).toBe(true);
  });

  it("supports task create, update, list, and delete operations", async () => {
    const base = await startApi();
    const createdResponse = await fetch(`${base}/api/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Test task ${Date.now()}`, description: "API coverage", assignedUser: "Test Student" }) });
    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json();
    expect(created.data.id).toBeTruthy();
    const id = created.data.id as string;

    const updatedResponse = await fetch(`${base}/api/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
    expect(updatedResponse.status).toBe(200);
    expect((await updatedResponse.json()).data.status).toBe("completed");

    const listResponse = await fetch(`${base}/api/tasks`);
    expect((await listResponse.json()).data.some((task: { id: string }) => task.id === id)).toBe(true);

    const deletedResponse = await fetch(`${base}/api/tasks/${id}`, { method: "DELETE" });
    expect(deletedResponse.status).toBe(200);
  });
});
