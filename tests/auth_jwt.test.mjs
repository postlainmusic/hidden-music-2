import assert from "node:assert";
import { test, describe } from "node:test";
import { sign, verify } from "hono/jwt";

const SECRET = "default_vault_jwt_secret_key_change_in_production";
const OTHER_SECRET = "wrong_secret_key_1234567890123456";

describe("JWT Authentication & Token Security Tests", () => {
  test("issued token can be verified with matching secret", async () => {
    const user = {
      id: "usr_123456",
      email: "testuser@gmail.com",
      name: "Test User",
      role: "listener",
      status: "active"
    };

    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = await sign({ ...user, user, exp }, SECRET, "HS256");

    const payload = await verify(token, SECRET, "HS256");
    assert.ok(payload);
    assert.strictEqual(payload.email, "testuser@gmail.com");
    assert.strictEqual(payload.user.id, "usr_123456");
  });

  test("token signed with wrong secret fails verification", async () => {
    const user = {
      id: "usr_123456",
      email: "testuser@gmail.com",
      role: "listener"
    };

    const token = await sign({ ...user, user }, OTHER_SECRET, "HS256");

    await assert.rejects(async () => {
      await verify(token, SECRET, "HS256");
    });
  });

  test("tampered token payload fails verification", async () => {
    const user = {
      id: "usr_123456",
      email: "user@gmail.com",
      role: "listener"
    };

    const token = await sign({ ...user, user }, SECRET, "HS256");
    const parts = token.split(".");

    // Tamper payload (middle part) to claim admin role
    const forgedPayloadStr = Buffer.from(
      JSON.stringify({ id: "usr_123456", email: "user@gmail.com", role: "admin" })
    ).toString("base64url");

    const tamperedToken = `${parts[0]}.${forgedPayloadStr}.${parts[2]}`;

    await assert.rejects(async () => {
      await verify(tamperedToken, SECRET, "HS256");
    });
  });

  test("expired token fails verification", async () => {
    const user = {
      id: "usr_123456",
      email: "testuser@gmail.com"
    };

    const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
    const token = await sign({ ...user, exp }, SECRET, "HS256");

    await assert.rejects(async () => {
      await verify(token, SECRET, "HS256");
    });
  });

  test("legacy base64 token format fails verification", async () => {
    const legacyUser = { id: "usr_hacker", email: "admin@postlain.com", role: "admin" };
    const legacyBase64 = Buffer.from(JSON.stringify(legacyUser)).toString("base64");

    await assert.rejects(async () => {
      await verify(legacyBase64, SECRET, "HS256");
    });
  });
});
