import assert from "node:assert/strict";
import { createProductInStore, getApp, getProductStoreState, listProducts } from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";

function safeMessage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let text = value.slice(0, 2000);
  for (const name of [
    "APP_STORE_CONNECT_PRIVATE_KEY", "APP_STORE_CONNECT_KEY_ID",
    "APP_STORE_CONNECT_ISSUER_ID", "APP_STORE_IAP_PRIVATE_KEY", "APP_STORE_IAP_KEY_ID",
  ]) {
    const secret = process.env[name];
    if (secret) text = text.split(secret).join("[redacted]");
  }
  return text.replace(/-----BEGIN[\s\S]*?-----END[^-]+-----/g, "[redacted]")
    .replace(/\beyJ[A-Za-z0-9_.-]+\b/g, "[redacted]");
}

async function main() {
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  const appId = process.env.REVENUECAT_APPLE_APP_STORE_APP_ID;
  assert(projectId && appId);
  const client = await getUncachableRevenueCatClient();
  const app = await getApp({ client, path: { project_id: projectId, app_id: appId } });
  assert(!app.error && app.data?.name === "Academik iOS" && app.data.type === "app_store");
  assert.equal((app.data.app_store as { bundle_id?: string }).bundle_id, "app.replit.academik");
  const products = await listProducts({
    client, path: { project_id: projectId }, query: { limit: 100 },
  });
  assert(!products.error && products.data && !products.data.next_page);
  const ios = products.data.items.filter(p => p.app_id === appId);
  for (const product of ios) {
    const state = await getProductStoreState({
      client, path: { project_id: projectId, product_id: product.id },
    });
    console.log(JSON.stringify({
      sku: product.store_identifier, type: product.type,
      status: state.response?.status,
      storeStatus: state.data?.store_status,
      warnings: state.data?.warnings?.map(safeMessage),
      errorType: state.error?.type,
      errorMessage: safeMessage(state.error?.message),
    }));
    if (process.argv.includes("--create-missing") && state.data?.store_status?.status === "not_found") {
      assert.equal(product.type, "consumable");
      assert([
        "fr.academik.app.starter", "fr.academik.app.essentiel", "fr.academik.app.pro",
      ].includes(product.store_identifier), "Unexpected product; refusing store creation");
      const created = await createProductInStore({
        client, path: { project_id: projectId, product_id: product.id },
      });
      console.log(JSON.stringify({
        sku: product.store_identifier, operation: "create_in_store",
        status: created.response?.status,
        errorType: created.error?.type,
        errorMessage: safeMessage(created.error?.message),
      }));
      if (created.error) {
        process.exitCode = 1;
        return;
      }
    }
  }
}

main().catch(() => {
  console.error("Apple product audit could not be completed; sensitive details suppressed.");
  process.exitCode = 1;
});
