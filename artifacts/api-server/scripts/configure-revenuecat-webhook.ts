import { randomUUID, createHmac } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { webhookAuthorization } from "../src/lib/iapLedger";

async function main() {
  const project = process.env.REVENUECAT_PROJECT_ID;
  const origin = new URL(process.env.PUBLIC_APP_URL || "");
  if (origin.protocol !== "https:" || origin.pathname !== "/" || origin.search || origin.hash) throw new Error("PUBLIC_APP_URL must be the verified HTTPS production origin");
  if (!project || !["carry_debt", "cap_zero"].includes(process.env.IAP_REFUND_POLICY || "")) throw new Error("Configure the RevenueCat project and approved refund policy first");
  const connector = new ReplitConnectors();
  const base = `/v2/projects/${project}`;
  const details = await connector.proxy("revenuecat", "/v2/projects?limit=100", { method: "GET" });
  if (!details.ok) throw new Error(`Cannot verify the RevenueCat project (${details.status})`);
  const matchingProject = (await details.json()).items.find((item: any) => item.id === project);
  if (matchingProject?.name !== "Academik") throw new Error("Refusing to change a project other than Academik");
  const url = `${origin.origin}/api/iap/webhook`;
  const authorization = webhookAuthorization();
  const raw = JSON.stringify({ api_version: "1.0", event: { type: "TEST", id: randomUUID() } });
  const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: authorization };
  if (process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    headers["X-RevenueCat-Webhook-Signature"] = `t=${timestamp},v1=${createHmac("sha256", process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET).update(`${timestamp}.${raw}`).digest("hex")}`;
  }
  const probe = await fetch(url, { method: "POST", headers, body: raw, signal: AbortSignal.timeout(15000), redirect: "error" });
  if (!probe.ok) throw new Error(`Publish the updated API and verify shared server secrets before configuring RevenueCat (endpoint returned ${probe.status})`);
  if (!probe.headers.get("content-type")?.includes("application/json")) throw new Error("Publish the updated API first: the production webhook URL still returns HTML instead of JSON");
  const result = await probe.json();
  if (!result.test || result.refundPolicy !== process.env.IAP_REFUND_POLICY) throw new Error("Production refund configuration differs from the approved local configuration");
  const list = await connector.proxy("revenuecat", `${base}/integrations/webhooks?limit=100`, { method: "GET" });
  if (!list.ok) throw new Error(`Cannot list RevenueCat integrations (${list.status})`);
  const existing = (await list.json()).items.filter((item: any) => item.name === "Academik credit refunds");
  if (existing.length > 1) throw new Error("Multiple matching integrations: inspect them before changing anything");
  const config = { name: "Academik credit refunds", url, authorization_header: authorization, environment: null, app_id: null, event_types: ["cancellation", "refund_reversed"] };
  const path = `${base}/integrations/webhooks${existing[0] ? `/${existing[0].id}` : ""}`;
  const saved = await connector.proxy("revenuecat", path, { method: "POST", body: JSON.stringify(config), headers: { "Content-Type": "application/json" } });
  if (!saved.ok) throw new Error(`RevenueCat webhook configuration failed (${saved.status})`);
  // Never print the response: RevenueCat can include a signing secret.
  console.log(`Academik refund webhook configured and authenticated at ${url}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
