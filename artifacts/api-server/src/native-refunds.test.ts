import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "./db";
import { authUsers } from "./replit_integrations/auth/storage";
import { creditTransactions, userCredits } from "@workspace/db";
import { applyVerifiedRefund, assertNotRefunded, type VerifiedRefund } from "./lib/iapRefunds";
import { authenticateWebhook, purchaseKey, refundStateKey, webhookAuthorization } from "./lib/iapLedger";
import { storage } from "./storage";

test("webhook authentication, strict signature and timestamp validation", () => {
  const prior = process.env.SESSION_SECRET;
  const signing = process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET;
  try {
    process.env.SESSION_SECRET = randomUUID();
    const auth = webhookAuthorization();
    const raw = Buffer.from('{"event":{"type":"TEST"}}');
    delete process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET;
    assert.equal(authenticateWebhook("bad", undefined, raw), false);
    assert.equal(authenticateWebhook(auth, undefined, raw), true);
    process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET = randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    const mac = createHmac("sha256", process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET).update(`${timestamp}.`).update(raw).digest("hex");
    const signature = `t=${timestamp},v1=${mac}`;
    assert.equal(authenticateWebhook(auth, signature, raw), true);
    assert.equal(authenticateWebhook(auth, signature, Buffer.from("{}")), false);
    assert.equal(authenticateWebhook(auth, signature, raw, Date.now() + 301000), false);
    assert.equal(authenticateWebhook(auth, undefined, raw), false);
    assert.equal(authenticateWebhook(auth, "t=x,v1=bad", raw), false);
  } finally {
    if (prior === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = prior;
    if (signing === undefined) delete process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET; else process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET = signing;
  }
});

test("refunds, reversals, duplicates, out-of-order delivery, deleted users and concurrent spending", {
  skip: process.env.RUN_NATIVE_REFUND_TEST !== "1",
}, async () => {
  assert.ok(process.env.REPLIT_DEV_DOMAIN?.endsWith(".replit.dev"));
  const [user] = await db.insert(authUsers).values({ email: `native-refund-${randomUUID()}@example.invalid`, passwordHash: "test-only-disabled-login", firstName: "QA", lastName: "Refund", verified: true }).returning();
  const uid = String(user.id);
  const txid = `refund-test-${randomUUID()}`;
  const key = purchaseKey("app_store", txid);
  const events: VerifiedRefund[] = [];
  const eventEpoch = Date.now() - 100000;
  const createEvent = (offset: number, refunded: boolean, transactionId = txid): VerifiedRefund => {
    const event = { id: randomUUID(), timestamp: eventEpoch + offset, userId: uid, store: "app_store", transactionId, refunded };
    events.push(event); return event;
  };
  const extraKeys: string[] = [];
  try {
    await db.insert(userCredits).values({ userId: uid, credits: 3 });
    await db.insert(creditTransactions).values({ userId: uid, amount: 10, type: "purchase", stripeSessionId: key });
    const first = createEvent(0, true);
    const repeated = await Promise.all(Array.from({ length: 5 }, () => applyVerifiedRefund(first, "carry_debt")));
    assert.equal(repeated.reduce((sum, r) => sum + r.creditsChanged, 0), -10);
    assert.equal(await storage.getCredits(uid), -7);
    assert.equal(await storage.spendCredits(uid, 1, "must be denied"), false);
    assert.equal(await db.transaction(tx => assertNotRefunded(tx, key)), false);
    assert.equal((await applyVerifiedRefund(createEvent(1000, false), "carry_debt")).creditsChanged, 10);
    assert.equal(await storage.getCredits(uid), 3);
    assert.equal((await applyVerifiedRefund(createEvent(500, true), "carry_debt")).stale, true);
    assert.equal(await storage.getCredits(uid), 3);
    const secondRefund = createEvent(2000, true);
    assert.equal((await applyVerifiedRefund(secondRefund, "cap_zero")).creditsChanged, -3);
    assert.equal(await storage.getCredits(uid), 0);
    assert.equal((await applyVerifiedRefund(createEvent(3000, false), "cap_zero")).creditsChanged, 3);
    assert.equal(await storage.getCredits(uid), 3);
    // Refund arriving before any grant must block a later stale purchase replay.
    const earlyId = `early-${randomUUID()}`; extraKeys.push(refundStateKey(purchaseKey("app_store", earlyId)));
    await applyVerifiedRefund(createEvent(4000, true, earlyId), "carry_debt");
    assert.equal(await db.transaction(tx => assertNotRefunded(tx, purchaseKey("app_store", earlyId))), false);
    await applyVerifiedRefund(createEvent(5000, false, earlyId), "carry_debt");
    assert.equal(await storage.getCredits(uid), 3); // no grant => no new pack on reversal
    // Balance updates and spending must serialize with a refund.
    await storage.addCredits(uid, 10, "bonus", "QA concurrency");
    await Promise.all([storage.spendCredits(uid, 2, "QA spend"), applyVerifiedRefund(createEvent(6000, true), "carry_debt")]);
    assert.equal(await storage.getCredits(uid), 1);
    const paymentId = `qa-payment-${randomUUID()}`;
    await Promise.all(Array.from({ length: 3 }, () => storage.addCredits(uid, 5, "purchase", "QA payment", paymentId)));
    assert.equal(await storage.getCredits(uid), 6);
    // Exercise the actual HTTP adapter and real read-only RevenueCat catalog.
    const { default: express } = await import("express");
    const { registerIapWebhook } = await import("./routes/iapWebhook");
    const app = express();
    app.use(express.json({ verify: (req, _res, raw) => { (req as any).rawBody = raw; } }));
    app.use((req, _res, next) => { (req as any).log = { error: () => {} }; next(); });
    registerIapWebhook(app);
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    const address = server.address() as { port: number };
    const policyBefore = process.env.IAP_REFUND_POLICY;
    process.env.IAP_REFUND_POLICY = "carry_debt";
    const post = async (event: object, authenticated = true) => {
      const raw = JSON.stringify({ api_version: "1.0", event });
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authenticated) headers.Authorization = webhookAuthorization();
      if (process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET) {
        const t = Math.floor(Date.now() / 1000);
        headers["X-RevenueCat-Webhook-Signature"] = `t=${t},v1=${createHmac("sha256", process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET).update(`${t}.${raw}`).digest("hex")}`;
      }
      return fetch(`http://127.0.0.1:${address.port}/api/iap/webhook`, { method: "POST", headers, body: raw });
    };
    try {
      assert.equal((await post({ id: randomUUID(), type: "TEST" }, false)).status, 401);
      assert.equal((await post({ id: randomUUID(), type: "TEST" })).status, 200);
      const notification = {
        id: randomUUID(), type: "REFUND_REVERSED", event_timestamp_ms: Date.now(),
        app_id: "app13bbfed722", app_user_id: `academik:${uid}`, store: "APP_STORE",
        environment: "SANDBOX", product_id: "fr.academik.app.starter", transaction_id: txid,
      };
      assert.equal((await post({ ...notification, app_id: "another-project" })).status, 400);
      assert.equal((await post({ ...notification, product_id: "unknown-pack" })).status, 400);
      const reversed = await post(notification);
      assert.equal(reversed.status, 200);
      assert.equal((await reversed.json()).creditsChanged, 10);
      assert.equal(await storage.getCredits(uid), 16);
      const cancellation = { ...notification, id: randomUUID(), type: "CANCELLATION", event_timestamp_ms: Date.now() + 1 };
      const refunded = await post(cancellation);
      assert.equal(refunded.status, 200);
      assert.equal((await refunded.json()).creditsChanged, -10);
      assert.equal((await post(cancellation)).status, 200);
      assert.equal(await storage.getCredits(uid), 6);
      const { digest } = await import("./lib/iapLedger");
      extraKeys.push(`rc_event_${digest(notification.id)}`, `rc_event_${digest(cancellation.id)}`);
    } finally {
      await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
      if (policyBefore === undefined) delete process.env.IAP_REFUND_POLICY; else process.env.IAP_REFUND_POLICY = policyBefore;
      await db.delete(creditTransactions).where(eq(creditTransactions.stripeSessionId, paymentId));
    }
    await db.delete(authUsers).where(eq(authUsers.id, user.id));
    await db.delete(userCredits).where(eq(userCredits.userId, uid));
    await applyVerifiedRefund({ ...createEvent(7000, false), timestamp: Date.now() + 1000 }, "carry_debt");
    assert.equal((await db.select().from(userCredits).where(eq(userCredits.userId, uid))).length, 0);
    console.log("Refund ledger checks passed without real payments or emails.");
  } finally {
    const { digest } = await import("./lib/iapLedger");
    const keys = [key, refundStateKey(key), ...extraKeys, ...events.map(e => `rc_event_${digest(e.id)}`)];
    await db.delete(creditTransactions).where(inArray(creditTransactions.stripeSessionId, keys));
    await db.delete(creditTransactions).where(eq(creditTransactions.userId, uid));
    await db.delete(userCredits).where(eq(userCredits.userId, uid));
    await db.delete(authUsers).where(eq(authUsers.id, user.id));
    await pool.end();
  }
});
