import assert from "node:assert/strict";
import { createPrivateKey, sign } from "node:crypto";

type Resource = {
  id: string;
  attributes?: Record<string, unknown>;
};

async function main() {
  const raw = process.env.APP_STORE_CONNECT_PRIVATE_KEY?.trim().replace(/\\r\\n|\\n|\\r/g, "\n");
  const match = raw?.match(/^-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----$/);
  assert(match);
  const body = match[1].replace(/\s/g, "");
  assert(/^[A-Za-z0-9+/]+={0,2}$/.test(body));
  const key = createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g)!.join("\n")}\n-----END PRIVATE KEY-----\n`);
  const issuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  assert(issuer && keyId);
  const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "ES256", kid: keyId, typ: "JWT" })}.${encode({
    iss: issuer, iat: now - 30, exp: now + 300, aud: "appstoreconnect-v1",
  })}`;
  const jwt = `${unsigned}.${sign("sha256", Buffer.from(unsigned), { key, dsaEncoding: "ieee-p1363" }).toString("base64url")}`;
  async function list(path: string): Promise<Resource[]> {
    let next: string | undefined = path;
    const items: Resource[] = [];
    for (let page = 0; next && page < 10; page++) {
      const url: URL = new URL(next, "https://api.appstoreconnect.apple.com");
      assert.equal(url.origin, "https://api.appstoreconnect.apple.com");
      const response = await fetch(url, {
        headers: { authorization: `Bearer ${jwt}` }, signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        console.error(JSON.stringify({ operation: "apple-catalog-read", status: response.status }));
        throw new Error("Apple catalog inaccessible");
      }
      const json = await response.json() as { data: Resource[]; links?: { next?: string } };
      items.push(...json.data);
      next = json.links?.next;
    }
    assert(!next, "Catalog pagination incomplete");
    return items;
  }
  // Only inspect Academik identities; no unrelated app or customer data.
  const apps = await list("/v1/apps?filter%5BbundleId%5D=app.replit.academik,fr.academik.app&limit=200");
  for (const app of apps) {
    const products = await list(`/v1/apps/${encodeURIComponent(app.id)}/inAppPurchasesV2?limit=200`);
    console.log(JSON.stringify({
      bundle: app.attributes?.bundleId,
      products: products.map(p => ({
        sku: p.attributes?.productId, type: p.attributes?.inAppPurchaseType,
        state: p.attributes?.state, name: p.attributes?.name,
      })),
    }));
  }
}

main().catch(() => {
  console.error("Apple catalog inspection stopped; sensitive diagnostics suppressed.");
  process.exitCode = 1;
});
