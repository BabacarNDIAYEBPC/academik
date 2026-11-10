import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import { authUsers } from "./replit_integrations/auth/storage";
import { userCredits, creditTransactions, bibliographies, invoices } from "@workspace/db";

test("native bearer session, library, export, rejection of fake purchases and account deletion", {
  skip: process.env.RUN_NATIVE_SMOKE !== "1",
}, async () => {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  assert.ok(domain?.endsWith(".replit.dev"), "This test only targets the development server");
  const base = `https://${domain}`;
  const password = `QA-${randomUUID()}!`;
  const [user] = await db.insert(authUsers).values({ email: `native-${randomUUID()}@example.invalid`, passwordHash: await bcrypt.hash(password, 12), firstName: "Recette", lastName: "Native", verified: true }).returning();
  assert.ok(user);
  const request = async (path: string, method = "GET", body?: object, token?: string) => {
    const res = await fetch(`${base}/api${path}`, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, data: await res.json() as any };
  };
  try {
    assert.equal((await request("/credits")).status, 401);
    assert.equal((await request("/auth/login", "POST", { email: user.email, password: "wrong" })).status, 401);
    const login = await request("/auth/login", "POST", { email: user.email, password });
    assert.equal(login.status, 200);assert.equal(typeof login.data.accessToken, "string");
    const token = login.data.accessToken;
    assert.equal(String((await request("/auth/user", "GET", undefined, token)).data.id), String(user.id));
    const before = (await request("/credits", "GET", undefined, token)).data.credits;
    assert.equal((await request("/iap/verify", "POST", { productId: "not-a-product", transactionId: "forged" }, token)).status, 422);
    assert.equal((await request("/iap/verify", "POST", { productId: "fr.academik.app.starter", transactionId: "forged" }, token)).status, 422);
    assert.equal((await request("/credits", "GET", undefined, token)).data.credits, before);
    const saved = await request("/bibliographies", "POST", { title: "Native smoke fixture", query: "test technique", norm: "APA7", content: "Bibliographie de recette.", sources: [{ title: "Article de recette technique", year: "2026", lastName: "Test", firstName: "Native", publisher: "Recette", url: "https://example.com" }] }, token);
    assert.ok([200, 201].includes(saved.status));
    const id = saved.data.id;assert.ok(id);
    assert.equal((await request(`/bibliographies/${id}`, "PATCH", { title: "Native smoke renamed" }, token)).status, 200);
    assert.equal((await request("/bibliographies", "GET", undefined, token)).data.find((item: any) => item.id === id).title, "Native smoke renamed");
    const exported = await request("/exports/word", "POST", { title: "Recette", content: "Texte de test." }, token);
    assert.equal(exported.status, 200);assert.equal(Buffer.from(exported.data.base64, "base64").subarray(0, 2).toString(), "PK");
    assert.ok([200, 204].includes((await request(`/bibliographies/${id}`, "DELETE", undefined, token)).status));
    assert.equal((await request("/auth/logout", "POST", undefined, token)).status, 200);
    assert.equal((await request("/credits", "GET", undefined, token)).status, 401);
    const relogin = await request("/auth/login", "POST", { email: user.email, password });
    const otherSession = await request("/auth/login", "POST", { email: user.email, password });
    assert.equal((await request("/user/account", "DELETE", undefined, relogin.data.accessToken)).status, 200);
    assert.equal((await request("/auth/user", "GET", undefined, relogin.data.accessToken)).status, 401);
    assert.equal((await request("/credits", "GET", undefined, otherSession.data.accessToken)).status, 401);
    assert.equal((await db.select().from(authUsers).where(eq(authUsers.id, user.id))).length, 0);
    console.info("Native API smoke: all assertions passed; no real emails or payments sent.");
    if (process.env.NATIVE_QA_FIXTURE === "1") {
      const [qa] = await db.insert(authUsers).values({ email: `native-ui-${randomUUID()}@example.invalid`, passwordHash: await bcrypt.hash(password, 12), firstName: "Recette", lastName: "Mobile", verified: true }).returning();
      assert.ok(qa);
      await db.insert(userCredits).values({ userId: String(qa.id), credits: 20 });
      await db.insert(bibliographies).values({ userId: String(qa.id), title: "Recette native à renommer", query: "Test technique natif", norm: "APA7", content: "Texte de recette pour vérifier le partage et l’export Word.", sources: [{ title: "Article de recette technique", year: "2026", lastName: "Test", firstName: "Native", publisher: "Recette", url: "https://example.com" }] });
      await writeFile("/tmp/academik-native-qa.json", JSON.stringify({ email: qa.email, password, userId: qa.id, mobileUrl: `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}` }), { mode: 0o600 });
      console.info("Disposable browser QA account prepared at /tmp/academik-native-qa.json");
    }
  } finally {
    const id = String(user.id);
    await db.delete(bibliographies).where(eq(bibliographies.userId, id));
    await db.delete(creditTransactions).where(eq(creditTransactions.userId, id));
    await db.delete(invoices).where(eq(invoices.userId, id));
    await db.delete(userCredits).where(eq(userCredits.userId, id));
    await db.delete(authUsers).where(eq(authUsers.id, user.id));
    await pool.end();
  }
});
