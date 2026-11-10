import assert from "node:assert/strict";
import {
  getApp, getProductStoreState, getProductStoreStateOperation, listProducts, setProductStoreState,
} from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";
import { academikAppleGet } from "./academikAppleClient";

const packs = [
  { sku: "app.replit.academik.starter", credits: 10, euroMicros: 4_990_000 },
  { sku: "app.replit.academik.essentiel", credits: 30, euroMicros: 12_990_000 },
  { sku: "app.replit.academik.pro", credits: 100, euroMicros: 39_990_000 },
];
let stage = "validate-catalog";

async function main() {
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  const appId = process.env.REVENUECAT_APPLE_APP_STORE_APP_ID;
  assert(projectId && appId);
  const client = await getUncachableRevenueCatClient();
  const app = await getApp({ client, path: { project_id: projectId, app_id: appId } });
  assert(!app.error && app.data?.type === "app_store" && app.data.name === "Academik iOS");
  assert.equal((app.data.app_store as { bundle_id?: string }).bundle_id, "app.replit.academik");
  const catalog = await listProducts({ client, path: { project_id: projectId }, query: { limit: 100 } });
  assert(!catalog.error && catalog.data && !catalog.data.next_page);
  const appleGet = academikAppleGet();
  const territories = await appleGet<{ data: { id: string }[]; links?: { next?: string } }>("/v1/territories?limit=200");
  assert(!territories.links?.next && territories.data.some(t => t.id === "FRA"));
  const availableTerritories = Object.fromEntries(territories.data.map(t => [t.id, true]));
  for (const pack of packs) {
    const product = catalog.data.items.find(p => p.app_id === appId && p.store_identifier === pack.sku);
    assert(product?.type === "consumable");
    const path = { project_id: projectId, product_id: product.id };
    stage = pack.sku;
    const result = await setProductStoreState({
      client, path,
      body: { store: "app_store", common: {
        availability: { territories: availableTerritories, available_in_new_territories: true },
        pricing: { territory_prices: { FRA: { amount_micros: pack.euroMicros, currency: "EUR" } } },
        localizations: {
          "fr-FR": { name: `${pack.credits} crédits Academik`, description: `${pack.credits} crédits de recherche et analyse.` },
          "en-US": { name: `${pack.credits} Academik credits`, description: `${pack.credits} credits for research and analysis.` },
        },
      } },
    });
    if (result.error || !result.data) {
      console.error(JSON.stringify({ sku: pack.sku, status: result.response?.status, message: result.error?.message?.slice(0, 700) }));
      process.exitCode = 1;
      return;
    }
    const operationPath = { ...path, operation_id: result.data.operation_id };
    let complete = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const op = await getProductStoreStateOperation({ client, path: operationPath });
      assert(!op.error && op.data);
      if (op.data.status === "failed") {
        console.error(JSON.stringify({ sku: pack.sku, status: "failed", message: op.data.error_message?.slice(0, 700) }));
        process.exitCode = 1;
        return;
      }
      if (op.data.status === "succeeded") { complete = true; break; }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    assert(complete, "Store operation pending; do not enqueue again until checked");
    const state = await getProductStoreState({ client, path });
    assert(!state.error && state.data);
    const common = state.data.common as {
      pricing?: { territory_prices?: Record<string, { amount_micros: number; currency: string }> };
      localizations?: Record<string, { name: string; description: string }>;
      availability?: { territories?: Record<string, boolean> };
    };
    const france = common.pricing?.territory_prices?.FR || common.pricing?.territory_prices?.FRA;
    assert.equal(france?.amount_micros, pack.euroMicros);
    assert.equal(france?.currency, "EUR");
    assert.equal(common.localizations?.["fr-FR"]?.name, `${pack.credits} crédits Academik`);
    console.log(JSON.stringify({
      sku: pack.sku, metadataOperation: "succeeded", storeStatus: state.data.store_status,
      francePrice: france, locales: Object.keys(common.localizations || {}),
      availableTerritories: Object.keys(common.availability?.territories || {}).length,
    }));
  }
}

main().catch(() => {
  console.error(JSON.stringify({ stage, error: "Store metadata operation not confirmed; sensitive details suppressed." }));
  process.exitCode = 1;
});
