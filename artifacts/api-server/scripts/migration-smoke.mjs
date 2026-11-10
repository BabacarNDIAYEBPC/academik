import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import bcrypt from "bcryptjs";

const base = "http://localhost:80";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const email = `migration-${randomUUID()}@example.invalid`;
const password = randomUUID();
let userId;
let cookie = "";

async function request(path, method = "GET", body, expected = 200) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.equal(response.status, expected, `${method} ${path}`);
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  return response.json();
}

try {
  assert.equal((await request("/api/healthz")).status, "ok");
  assert.equal((await request("/api/currency")).currency, "eur");
  await request("/api/auth/user", "GET", undefined, 401);
  await request("/api/bibliographies", "GET", undefined, 401);
  assert.equal((await request("/api/admin/me")).authenticated, false);
  await request("/api/admin/stats", "GET", undefined, 401);
  await request("/api/auth/login", "POST", {}, 400);
  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO auth_users (email, password_hash, verified) VALUES ($1, $2, true) RETURNING id",
    [email, hash],
  );
  userId = result.rows[0].id;
  const login = await request("/api/auth/login", "POST", { email, password });
  assert.equal(login.user.id, userId);
  assert.equal((await request("/api/auth/user")).id, userId);
  assert.equal((await request("/api/credits")).credits, 0);
  // The existing database's historical invoices table lacks stripe_session_id
  // and credits required by the original app. That pre-existing mismatch is
  // outside this port; do not alter customer data/schema to make this test pass.
  assert.deepEqual(await request("/api/credits/transactions"), []);
  const item = await request("/api/bibliographies", "POST", {
    title: "Migration smoke test", query: "literature", norm: "APA", content: "Test",
    sources: [],
  });
  assert.equal(item.userId, String(userId));
  assert((await request("/api/bibliographies")).some(row => row.id === item.id));
  const edited = await request(`/api/bibliographies/${item.id}`, "PATCH", {
    title: "Migration smoke test edited",
  });
  assert.equal(edited.title, "Migration smoke test edited");
  await request(`/api/bibliographies/${item.id}`, "DELETE");
  assert.deepEqual(await request("/api/bibliographies"), []);
  await request("/api/auth/logout", "POST");
  await request("/api/auth/user", "GET", undefined, 401);
  console.log("PASS: API health, currency, access controls, login/session, credits, bibliography create/read/update/delete, logout.");
  console.log("NOT CHECKED: authenticated invoices (pre-existing database/schema mismatch), paid services, email delivery.");
} finally {
  if (userId) {
    await pool.query("DELETE FROM bibliographies WHERE user_id = $1", [String(userId)]);
    await pool.query("DELETE FROM user_credits WHERE user_id = $1", [String(userId)]);
    await pool.query("DELETE FROM sessions WHERE sess->>'userId' = $1", [String(userId)]);
    await pool.query("DELETE FROM auth_users WHERE id = $1", [userId]);
  }
  await pool.end();
}
