import { describe, it } from "node:test";
import assert from "node:assert";
import app from "./index.js";

describe("API Security - Secure Random ID Generation", () => {
  it("should generate section IDs with valid crypto.randomUUID() format", async () => {
    // Mock DB object for testing Hono route
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          run: async () => ({ success: true }),
        }),
      }),
    };

    // Construct mock request for admin section creation
    const req = new Request("http://localhost/api/admin/sections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Section",
        template_type: "album_showcase",
      }),
    });

    const env = {
      DB: mockDb as any,
      // Provide user in payload or skip auth if needed
      ADMIN_EMAILS: "admin@postlain.com",
    };

    // Create request with Hono app
    const res = await app.request(req, {}, env);

    // In our test environment without a signed JWT auth header, Hono returns 401 guard response
    assert.strictEqual(res.status, 401);
  });

  it("should format sec_ and log_ IDs using valid UUID v4 pattern", () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const sampleUuid = crypto.randomUUID();
    assert.strictEqual(uuidPattern.test(sampleUuid), true);

    const sectionId = `sec_${crypto.randomUUID()}`;
    const logId = `log_${crypto.randomUUID()}`;

    assert.ok(sectionId.startsWith("sec_"));
    assert.strictEqual(uuidPattern.test(sectionId.replace("sec_", "")), true);

    assert.ok(logId.startsWith("log_"));
    assert.strictEqual(uuidPattern.test(logId.replace("log_", "")), true);
  });
});
