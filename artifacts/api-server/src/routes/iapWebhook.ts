import type { Express, Request, Response } from "express";
import { authenticateWebhook, iapApps } from "../lib/iapLedger";
import { applyVerifiedRefund, type RefundPolicy } from "../lib/iapRefunds";
import { getProduct } from "../lib/revenuecat";

export function registerIapWebhook(app: Express) {
  app.post("/api/iap/webhook", async (req: Request, res: Response) => {
    try {
      if (!authenticateWebhook(req.get("authorization"), req.get("X-RevenueCat-Webhook-Signature"), (req as Request & { rawBody: Buffer }).rawBody || Buffer.alloc(0))) {
        res.status(401).json({ message: "Invalid webhook authentication" }); return;
      }
      const event = req.body?.event;
      if (req.body?.api_version !== "1.0" || !event || typeof event.id !== "string" || !event.id || event.id.length > 255 || typeof event.type !== "string") {
        res.status(400).json({ message: "Invalid RevenueCat notification" }); return;
      }
      if (event.type === "TEST") { res.json({ ok: true, test: true, refundPolicy: process.env.IAP_REFUND_POLICY || null }); return; }
      if (!["CANCELLATION", "REFUND_REVERSED"].includes(event.type)) {
        res.json({ ok: true, ignored: true }); return;
      }
      const source = iapApps[event.store];
      const userId = typeof event.app_user_id === "string" && /^academik:[1-9]\d{0,9}$/.test(event.app_user_id) ? event.app_user_id.slice(9) : "__unassigned_iap__";
      if (!source || source.id !== event.app_id || !["PRODUCTION", "SANDBOX"].includes(event.environment)) {
        res.status(400).json({ message: "Unexpected app, store or environment" }); return;
      }
      if (process.env.NODE_ENV === "production" && (source.store === "test_store" || (event.environment !== "PRODUCTION" && !(process.env.IAP_SANDBOX_REVIEW_USER_IDS || "").split(",").map(v => v.trim()).includes(userId)))) {
        res.json({ ok: true, ignored: true }); return;
      }
      if (typeof event.transaction_id !== "string" || !event.transaction_id || event.transaction_id.length > 255 ||
        !Number.isSafeInteger(event.event_timestamp_ms) || event.event_timestamp_ms < 0 || event.event_timestamp_ms > Date.now() + 300000) {
        res.status(400).json({ message: "Invalid transaction or timestamp" }); return;
      }
      // Resolve the catalog from this project, not from any webhook-supplied price.
      const products = await import("../lib/revenuecat");
      const productId = await products.productResourceId(source.id, event.product_id);
      if (!productId) { res.status(400).json({ message: "Unknown credit pack" }); return; }
      const product = await getProduct(productId);
      if (product.type !== "consumable" || product.app_id !== source.id) { res.status(400).json({ message: "Invalid product" }); return; }
      const policy = process.env.IAP_REFUND_POLICY;
      if (policy !== "carry_debt" && policy !== "cap_zero") throw new Error("Refund policy is not configured");
      const result = await applyVerifiedRefund({
        id: event.id, timestamp: event.event_timestamp_ms, userId, store: source.store,
        transactionId: event.transaction_id, refunded: event.type === "CANCELLATION",
      }, policy as RefundPolicy);
      res.json({ ok: true, ...result });
    } catch (error) {
      req.log.error({ err: error }, "RevenueCat webhook processing failed");
      res.status(503).json({ message: "Webhook processing unavailable; retry required" });
    }
  });
}
