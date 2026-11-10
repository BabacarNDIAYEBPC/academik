import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const iapApps: Record<string, { id: string; store: string }> = {
  APP_STORE: { id: "app13bbfed722", store: "app_store" },
  PLAY_STORE: { id: "appff3c5e069e", store: "play_store" },
  TEST_STORE: { id: "app9e0d1e33d4", store: "test_store" },
};
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const purchaseKey = (store: string, transaction: string) => `rc_${digest(`${store}:${transaction}`)}`;
export const refundStateKey = (key: string) => `rc_state_${key.slice(3)}`;

// Domain-separated server credential: never expose it in responses or logs.
// Rotating SESSION_SECRET requires reconfiguring the RevenueCat integration.
export function webhookAuthorization(): string {
  if (!process.env.SESSION_SECRET) throw new Error("Webhook authentication is not configured");
  return `Bearer rcwh_${createHmac("sha256", process.env.SESSION_SECRET).update("academik:revenuecat:webhook:v1").digest("hex")}`;
}
function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function authenticateWebhook(authorization: string | undefined, signature: string | undefined, raw: Buffer, now = Date.now()): boolean {
  if (!equal(authorization || "", webhookAuthorization())) return false;
  const signingSecret = process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) return true;
  if (!signature || signature.length > 500) return false;
  const parts = Object.fromEntries(signature.split(",").map(part => part.trim().split("=")));
  if (!/^\d+$/.test(parts.t || "") || !/^[a-f0-9]{64}$/i.test(parts.v1 || "")) return false;
  if (Math.abs(now / 1000 - Number(parts.t)) > 300) return false;
  const expected = createHmac("sha256", signingSecret).update(`${parts.t}.`).update(raw).digest("hex");
  return equal(expected, parts.v1.toLowerCase());
}
