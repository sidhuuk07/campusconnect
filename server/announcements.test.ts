import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("announcements.list", () => {
  it("returns a stable collection with unique identifiers", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const result = await appRouter.createCaller(ctx).announcements.list();
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(new Set(result.map(item => item.id)).size).toBe(result.length);
    expect(result.every(item => item.title && item.summary && item.category)).toBe(true);
  });
});
