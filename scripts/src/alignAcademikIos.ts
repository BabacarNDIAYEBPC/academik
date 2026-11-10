import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { listProjects, listApps, listProducts, listOfferings, updateApp } from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";

function textField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" ? field : undefined;
}

async function main() {
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  assert(projectId, "REVENUECAT_PROJECT_ID is required");
  const client = await getUncachableRevenueCatClient();
  const projects = await listProjects({ client, query: { limit: 100 } });
  assert(!projects.error && projects.data, "Cannot verify RevenueCat project");
  const project = projects.data.items.find(p => p.id === projectId);
  assert.equal(project?.name, "Academik", "Only the dedicated Academik project may be changed");
  const apps = await listApps({ client, path: { project_id: projectId }, query: { limit: 100 } });
  assert(!apps.error && apps.data && !apps.data.next_page, "Cannot verify complete app list");
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify(apps.data.items.map(app => ({
      id: app.id, name: app.name, type: app.type,
      bundle: textField(app.app_store, "bundle_id"), package: textField(app.play_store, "package_name"),
    })), null, 2));
    return;
  }
  const appId = process.env.REVENUECAT_APPLE_APP_STORE_APP_ID;
  assert(appId, "REVENUECAT_APPLE_APP_STORE_APP_ID is required");
  const app = apps.data.items.find(a => a.id === appId);
  assert(app?.type === "app_store" && app.name === "Academik iOS", "Unexpected iOS app");
  const config = JSON.parse(await readFile(new URL("../../artifacts/academik-mobile/app.json", import.meta.url), "utf8"));
  const bundle: string = config.expo.ios.bundleIdentifier;
  assert.equal(bundle, "app.replit.academik", "Only the owner-approved Apple identity is allowed");
  assert.equal(config.expo.android.package, "fr.academik.app", "Android identity must stay unchanged");
  const previousBundle = textField(app.app_store, "bundle_id");
  assert(previousBundle && ["fr.academik.app", bundle].includes(previousBundle), "Unexpected previous bundle");
  assert(!apps.data.items.some(a => a.id !== appId && textField(a.app_store, "bundle_id") === bundle), "Another RevenueCat app already uses this bundle");

  async function catalogSnapshot() {
    const products = await listProducts({ client, path: { project_id: projectId! }, query: { limit: 100 } });
    const offerings = await listOfferings({ client, path: { project_id: projectId! }, query: { limit: 100 } });
    assert(!products.error && products.data && !products.data.next_page, "Cannot verify complete catalog");
    assert(!offerings.error && offerings.data && !offerings.data.next_page, "Cannot verify offerings");
    return {
      products: products.data.items.map(p => ({ id: p.id, app: p.app_id, sku: p.store_identifier, type: p.type })).sort((a, b) => a.id.localeCompare(b.id)),
      offerings: offerings.data.items.map(o => ({ id: o.id, key: o.lookup_key, current: o.is_current })).sort((a, b) => a.id.localeCompare(b.id)),
    };
  }
  const before = await catalogSnapshot();
  if (previousBundle !== bundle) {
    const updated = await updateApp({
      client, path: { project_id: projectId, app_id: appId },
      body: { app_store: { bundle_id: bundle } },
    });
    if (updated.error) {
      console.error("RevenueCat rejected the bundle update:", updated.response?.status);
      process.exitCode = 1;
      return;
    }
    assert.equal(textField(updated.data?.app_store, "bundle_id"), bundle, "Bundle update was not confirmed");
  }
  const readback = await listApps({ client, path: { project_id: projectId }, query: { limit: 100 } });
  assert(!readback.error && readback.data, "Cannot read back app configuration");
  assert.equal(textField(readback.data.items.find(a => a.id === appId)?.app_store, "bundle_id"), bundle);
  assert.deepEqual(await catalogSnapshot(), before, "Catalog or offerings changed unexpectedly");
  const others = (items: typeof apps.data.items) => items.filter(a => a.id !== appId).map(a => ({
    id: a.id, type: a.type, bundle: textField(a.app_store, "bundle_id"), package: textField(a.play_store, "package_name"),
  }));
  assert.deepEqual(others(readback.data.items), others(apps.data.items), "Another app changed unexpectedly");
  console.log(JSON.stringify({ aligned: true, iosBundle: bundle, sameRevenueCatApp: true, catalogUnchanged: true, androidUnchanged: true }));
}
main().catch(() => {
  console.error("Academik iOS alignment failed; configuration must be checked before publishing.");
  process.exitCode = 1;
});
