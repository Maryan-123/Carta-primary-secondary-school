import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../../src/app";

describe("GET /api/v1/health", () => {
  it("returns a healthy response", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("School management backend is running");
    expect(response.body.data.database).toBe("connected");
  });
});
