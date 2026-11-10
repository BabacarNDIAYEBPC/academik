import { ReplitConnectors } from "@replit/connectors-sdk";
import { db } from "../db";
import { userCredits, creditTransactions } from "@workspace/db";
import { authUsers } from "../replit_integrations/auth/storage";
import { eq, or, sql } from "drizzle-orm";
import { purchaseKey } from "./iapLedger";
import { assertNotRefunded } from "./iapRefunds";

const connectors = new ReplitConnectors();
const creditsByProduct: Record<string, number> = {
  "fr.academik.app.starter": 10,
  "fr.academik.app.essentiel": 30,
  "fr.academik.app.pro": 100,
};
const products = new Map<string, { value: any; expires: number }>();
function projectId() {
  const project = process.env.REVENUECAT_PROJECT_ID;
  if (!project) throw new Error("RevenueCat project is not configured");
  return project;
}
async function revenueCatGet(path: string, allowMissing = false): Promise<any> {
  const response = await connectors.proxy("revenuecat", path, { method: "GET" });
  if (allowMissing && response.status === 404) return { items: [] };
  if (!response.ok) throw new Error(`RevenueCat verification unavailable (${response.status})`);
  return response.json();
}
async function listPurchases(userId: string) {
  let path: string | null = `/v2/projects/${projectId()}/customers/${encodeURIComponent(`academik:${userId}`)}/purchases?limit=100`;
  const purchases: any[] = [];
  for (let page = 0; path && page < 20; page++) {
    const data = await revenueCatGet(path, page === 0);
    if (!Array.isArray(data.items)) throw new Error("Invalid RevenueCat purchase response");
    purchases.push(...data.items);
    if (data.next_page) {
      const next = new URL(data.next_page, "https://api.revenuecat.com");
      path = next.pathname + next.search;
    } else path = null;
  }
  if (path) throw new Error("Purchase history requires additional reconciliation");
  return purchases;
}
export async function getProduct(id: string) {
  const key = `${projectId()}:${id}`;
  const cached = products.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;
  const product = await revenueCatGet(`/v2/projects/${projectId()}/products/${encodeURIComponent(id)}`);
  products.set(key, { value: product, expires: Date.now() + 3600000 });
  return product;
}
export async function productResourceId(appId: string, storeIdentifier: unknown) {
  if (typeof storeIdentifier !== "string" || !creditsByProduct[storeIdentifier]) return null;
  const list = await revenueCatGet(`/v2/projects/${projectId()}/products?app_id=${encodeURIComponent(appId)}&limit=100`);
  if (!Array.isArray(list.items)) throw new Error("Invalid product catalog");
  return list.items.find((p: any) => p.app_id === appId && p.store_identifier === storeIdentifier)?.id || null;
}
function eligible(userId: string, purchase: any) {
  if (purchase.status !== "owned" || !["app_store", "play_store", "test_store"].includes(purchase.store)) return false;
  if (process.env.NODE_ENV !== "production") return true;
  const reviewers = (process.env.IAP_SANDBOX_REVIEW_USER_IDS || "").split(",").map(v => v.trim());
  return purchase.store !== "test_store" && (purchase.environment === "production" || reviewers.includes(userId));
}
async function creditVerifiedPurchase(userId: string, purchase: any, productId: string) {
  if (!eligible(userId, purchase)) throw new Error("Purchase is not eligible for this account");
  const product = await getProduct(purchase.product_id);
  const credits = creditsByProduct[productId];
  if (!credits || product.store_identifier !== productId || product.type !== "consumable" || purchase.quantity !== 1 || !purchase.store_purchase_identifier) throw new Error("Purchase product mismatch");
  // Stable across RevenueCat customer recreation; no raw store transaction in the ledger.
  const key = purchaseKey(purchase.store, purchase.store_purchase_identifier);
  const legacyKey = `rc_${purchase.id}`;
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${"account:" + userId}))`);
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);
    const [user] = await tx.select({ id: authUsers.id }).from(authUsers).where(eq(authUsers.id, Number(userId)));
    if (!user) throw new Error("Account no longer exists");
    if (!await assertNotRefunded(tx, key)) return { success: true, credits: 0, alreadyCredited: true, refunded: true };
    const [existing] = await tx.select().from(creditTransactions).where(or(eq(creditTransactions.stripeSessionId, key), eq(creditTransactions.stripeSessionId, legacyKey)));
    if (existing) {
      if (existing.userId !== userId) throw new Error("Purchase already assigned");
      if (existing.stripeSessionId !== key) await tx.update(creditTransactions).set({ stripeSessionId: key }).where(eq(creditTransactions.id, existing.id));
      return { success: true, credits: existing.amount, alreadyCredited: true };
    }
    await tx.insert(userCredits).values({ userId, credits }).onConflictDoUpdate({
      target: userCredits.userId, set: { credits: sql`${userCredits.credits} + ${credits}`, updatedAt: new Date() },
    });
    await tx.insert(creditTransactions).values({ userId, amount: credits, type: "purchase", description: `Achat ${purchase.store} — ${productId}`, stripeSessionId: key });
    return { success: true, credits, alreadyCredited: false };
  });
}
export async function verifyAndCreditPurchase(userId: string, transactionId: string, productId: string) {
  if (!creditsByProduct[productId] || !transactionId || transactionId.length > 255) throw new Error("Invalid purchase");
  const purchase = (await listPurchases(userId)).find(p => p.store_purchase_identifier === transactionId);
  if (!purchase) throw new Error("Purchase is not verified for this account");
  return creditVerifiedPurchase(userId, purchase, productId);
}
export async function synchronizePurchases(userId: string) {
  let creditsAdded = 0;
  let synchronizedPurchases = 0;
  // Query the authenticated customer's canonical store identifiers server-side.
  // CustomerInfo nonSubscriptionTransactions can contain RevenueCat IDs instead.
  for (const purchase of await listPurchases(userId)) {
    if (!eligible(userId, purchase)) continue;
    const product = await getProduct(purchase.product_id);
    if (!creditsByProduct[product.store_identifier] || product.type !== "consumable") continue;
    const result = await creditVerifiedPurchase(userId, purchase, product.store_identifier);
    if (!result.alreadyCredited) creditsAdded += result.credits;
    synchronizedPurchases++;
  }
  return { success: true, creditsAdded, synchronizedPurchases };
}
export async function deleteRevenueCatCustomer(userId: string) {
  if (!process.env.REVENUECAT_PROJECT_ID) return;
  const path = `/v2/projects/${projectId()}/customers/${encodeURIComponent(`academik:${userId}`)}`;
  // The connected OAuth integration does not request customers:read_write.
  // A narrowly scoped, server-only v2 key can supply this missing capability.
  const deletionKey = process.env.REVENUECAT_CUSTOMER_DELETE_API_KEY;
  const response = deletionKey
    ? await fetch(`https://api.revenuecat.com${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${deletionKey}` }, signal: AbortSignal.timeout(15000) })
    : await connectors.proxy("revenuecat", path, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error(`RevenueCat customer deletion unavailable (${response.status})`);
}
