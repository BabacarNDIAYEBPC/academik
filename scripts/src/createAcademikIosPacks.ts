import assert from "node:assert/strict";
import {
  attachProductsToPackage, createProduct, createProductInStore, detachProductsFromPackage,
  getApp, getProductsFromPackage, getProductStoreState, listOfferings, listPackages,
  listProducts, listProjects, type Product, type Package, type PackageProductAssociation,
} from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";

const packs = [
  { suffix: "starter", credits: 10, label: "Starter" },
  { suffix: "essentiel", credits: 30, label: "Essentiel" },
  { suffix: "pro", credits: 100, label: "Pro" },
];
let stage = "verify-project";

async function main() {
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  const appId = process.env.REVENUECAT_APPLE_APP_STORE_APP_ID;
  assert(projectId && appId);
  const client = await getUncachableRevenueCatClient();
  const projectPath = { project_id: projectId };
  const projects = await listProjects({ client, query: { limit: 100 } });
  assert(!projects.error && projects.data?.items.find(p => p.id === projectId)?.name === "Academik");
  const app = await getApp({ client, path: { ...projectPath, app_id: appId } });
  assert(!app.error && app.data?.type === "app_store" && app.data.name === "Academik iOS");
  assert.equal((app.data.app_store as { bundle_id?: string }).bundle_id, "app.replit.academik");
  const catalog = await listProducts({ client, path: projectPath, query: { limit: 100 } });
  assert(!catalog.error && catalog.data && !catalog.data.next_page);
  const otherProducts = catalog.data.items.filter(p => p.app_id !== appId);
  const offerings = await listOfferings({ client, path: projectPath, query: { limit: 100 } });
  assert(!offerings.error && offerings.data && !offerings.data.next_page);
  const current = offerings.data.items.filter(o => o.is_current);
  assert.equal(current.length, 1);
  const packages = await listPackages({
    client, path: { ...projectPath, offering_id: current[0].id }, query: { limit: 100 },
  });
  assert(!packages.error && packages.data && !packages.data.next_page);
  const createdProducts: Product[] = [];
  for (const pack of packs) {
    const sku = `app.replit.academik.${pack.suffix}`;
    stage = `catalog-${pack.suffix}`;
    let product: Product | undefined = catalog.data.items.find(p => p.app_id === appId && p.store_identifier === sku);
    if (!product) {
      const created: Awaited<ReturnType<typeof createProduct>> = await createProduct({
        client, path: projectPath,
        body: {
          app_id: appId, store_identifier: sku, type: "consumable",
          display_name: `Academik iOS ${pack.label} ${pack.credits} credits`,
        },
      });
      assert(!created.error && created.data, "Cannot create iOS RevenueCat product");
      product = created.data;
    }
    assert(product);
    assert.equal(product.type, "consumable");
    stage = `apple-${pack.suffix}`;
    const path = { ...projectPath, product_id: product.id };
    const state = await getProductStoreState({ client, path });
    assert(!state.error && state.data, "Cannot inspect store state");
    if (state.data.store_status?.status === "not_found") {
      stage = `push-${pack.suffix}`;
      const pushed = await createProductInStore({ client, path });
      if (pushed.error) {
        console.error(JSON.stringify({
          stage, status: pushed.response?.status, errorType: pushed.error.type,
          message: pushed.error.message?.slice(0, 700),
        }));
        process.exitCode = 1;
        return;
      }
    } else {
      assert(!["could_not_check", "unknown"].includes(state.data.store_status?.status || "unknown"));
    }
    stage = `confirm-${pack.suffix}`;
    const confirmed = await getProductStoreState({ client, path });
    assert(!confirmed.error && confirmed.data?.store_status);
    assert(!["not_found", "could_not_check", "unknown"].includes(confirmed.data.store_status.status));
    createdProducts.push(product);
    console.log(JSON.stringify({ sku, createdInApple: true, storeStatus: confirmed.data.store_status }));
  }

  for (const [index, pack] of packs.entries()) {
    stage = `offering-${pack.suffix}`;
    const pkg: Package | undefined = packages.data.items.find(p => p.lookup_key === `credits_${pack.credits}`);
    assert(pkg, "Existing credit package missing");
    const path: { project_id: string; package_id: string } = { ...projectPath, package_id: pkg.id };
    const attached = await getProductsFromPackage({ client, path, query: { limit: 100 } });
    assert(!attached.error && attached.data && !attached.data.next_page);
    const before = attached.data.items;
    const otherAssociations: PackageProductAssociation[] = before.filter(a => a.product.app_id !== appId);
    const target = createdProducts[index];
    const oldIos = before.filter(a => a.product.app_id === appId && a.product.id !== target.id);
    assert(oldIos.every(a => a.product.store_identifier === `fr.academik.app.${pack.suffix}`));
    if (oldIos.length) {
      const detached = await detachProductsFromPackage({
        client, path, body: { product_ids: oldIos.map(a => a.product.id) },
      });
      assert(!detached.error, "Cannot replace old iOS association");
    }
    if (!before.some(a => a.product.id === target.id)) {
      const attachedNew = await attachProductsToPackage({
        client, path, body: { products: [{ product_id: target.id, eligibility_criteria: "all" }] },
      });
      if (attachedNew.error) {
        if (oldIos.length) {
          const restored = await attachProductsToPackage({
            client, path, body: { products: oldIos.map(a => ({
              product_id: a.product.id, eligibility_criteria: a.eligibility_criteria,
            })) },
          });
          assert(!restored.error, "Package restoration requires attention");
        }
        throw new Error("New iOS association rejected");
      }
    }
    const after = await getProductsFromPackage({ client, path, query: { limit: 100 } });
    assert(!after.error && after.data);
    assert(after.data.items.some(a => a.product.id === target.id));
    assert.equal(after.data.items.filter(a => a.product.app_id === appId).length, 1);
    assert.deepEqual(
      after.data.items.filter(a => a.product.app_id !== appId).map(a => [a.product.id, a.eligibility_criteria]).sort(),
      otherAssociations.map(a => [a.product.id, a.eligibility_criteria]).sort(),
    );
    console.log(JSON.stringify({ package: pkg.lookup_key, iosSku: target.store_identifier, otherStoresUnchanged: true }));
  }
  const final = await listProducts({ client, path: projectPath, query: { limit: 100 } });
  assert(!final.error && final.data && !final.data.next_page);
  for (const prior of catalog.data.items) assert(final.data.items.some(p => p.id === prior.id));
  assert.deepEqual(final.data.items.filter(p => p.app_id !== appId), otherProducts);
  console.log(JSON.stringify({ completed: true, oldProductsPreserved: true, androidAndTestStoreUnchanged: true }));
}

main().catch(() => {
  console.error(JSON.stringify({ stage, error: "iOS pack setup incomplete; no credentials logged." }));
  process.exitCode = 1;
});
