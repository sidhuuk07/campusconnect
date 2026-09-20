import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "./auth";

describe("authentication helpers", () => {
  it("creates and verifies a role-aware JWT", async () => {
    const token = await createToken({ id: "student-1", email: "student@example.com", name: "Student", role: "student" });
    const user = await verifyToken(token);
    expect(user).toMatchObject({ id: "student-1", email: "student@example.com", role: "student" });
  });
});
