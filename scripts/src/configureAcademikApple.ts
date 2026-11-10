import assert from "node:assert/strict";
import { createPrivateKey, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getApp, listProjects, updateApp } from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";

let stage = "configuration";

function required(name: string): string {
  const value = process.env[name]?.trim();
  assert(value, `Missing ${name}`);
  return value;
}

function field(value: unknown, name: string): unknown {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)[name]
    : undefined;
}

async function main() {
  const projectId = required("REVENUECAT_PROJECT_ID");
  const appId = required("REVENUECAT_APPLE_APP_STORE_APP_ID");
  const client = await getUncachableRevenueCatClient();
  const projectResult = await listProjects({ client, query: { limit: 100 } });
  assert(!projectResult.error && projectResult.data, "Cannot verify project");
  assert.equal(projectResult.data.items.find(p => p.id === projectId)?.name, "Academik");
  const path = { project_id: projectId, app_id: appId };
  const before = await getApp({ client, path });
  assert(!before.error && before.data, "Cannot verify app");
  assert.equal(before.data.name, "Academik iOS");
  assert.equal(before.data.type, "app_store");
  const config = JSON.parse(await readFile(
    new URL("../../artifacts/academik-mobile/app.json", import.meta.url), "utf8",
  ));
  const bundle = config.expo.ios.bundleIdentifier;
  assert.equal(bundle, "app.replit.academik");
  assert.equal(field(before.data.app_store, "bundle_id"), bundle);

  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({
      appStoreConnectConfigured: field(before.data.app_store, "app_store_connect_api_key_configured"),
      inAppPurchaseKeyConfigured: field(before.data.app_store, "subscription_key_configured"),
    }));
    return;
  }

  stage = "private-key-validation";
  const suppliedPem = required("APP_STORE_CONNECT_PRIVATE_KEY").replace(/\\r\\n|\\n|\\r/g, "\n");
  const keyId = required("APP_STORE_CONNECT_KEY_ID");
  const issuer = required("APP_STORE_CONNECT_ISSUER_ID");
  stage = "key-id-format";
  assert(/^[a-zA-Z0-9]{8,32}$/.test(keyId), "Invalid key ID format");
  stage = "issuer-id-format";
  assert(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(issuer), "Invalid issuer format");
  stage = "private-key-pem-format";
  const envelope = suppliedPem.match(/^-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----$/);
  assert(envelope, "Expected complete PKCS8 PEM");
  // Secret forms can flatten line breaks. Rewrap only whitespace; never alter key bytes.
  const encodedKey = envelope[1].replace(/\s/g, "");
  assert(/^[A-Za-z0-9+/]+={0,2}$/.test(encodedKey) && encodedKey.length % 4 === 0);
  const pem = `-----BEGIN PRIVATE KEY-----\n${encodedKey.match(/.{1,64}/g)!.join("\n")}\n-----END PRIVATE KEY-----\n`;
  stage = "private-key-parsing";
  const key = createPrivateKey(pem);
  stage = "private-key-curve";
  assert.equal(key.asymmetricKeyType, "ec");
  assert.equal(key.asymmetricKeyDetails?.namedCurve, "prime256v1");

  stage = "apple-access-validation";
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "ES256", kid: keyId, typ: "JWT" })}.${encode({
    iss: issuer, iat: now - 30, exp: now + 300, aud: "appstoreconnect-v1",
  })}`;
  const signature = sign("sha256", Buffer.from(unsigned), {
    key, dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  const appleUrl = new URL("https://api.appstoreconnect.apple.com/v1/apps");
  appleUrl.searchParams.set("filter[bundleId]", bundle);
  appleUrl.searchParams.set("fields[apps]", "bundleId,name");
  appleUrl.searchParams.set("limit", "2");
  const appleResponse = await fetch(appleUrl, {
    headers: { authorization: `Bearer ${unsigned}.${signature}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!appleResponse.ok) {
    console.error(JSON.stringify({ stage, status: appleResponse.status }));
    process.exitCode = 1;
    return;
  }
  const apple = await appleResponse.json() as {
    data?: { attributes?: { bundleId?: string } }[];
  };
  assert.equal(apple.data?.length, 1, "Expected exactly one matching Apple app");
  assert.equal(apple.data?.[0]?.attributes?.bundleId, bundle);

  stage = "revenuecat-key-configuration";
  const updated = await updateApp({
    client, path,
    body: { app_store: {
      app_store_connect_api_key: pem,
      app_store_connect_api_key_id: keyId,
      app_store_connect_api_key_issuer: issuer,
    } },
  });
  if (updated.error) {
    console.error(JSON.stringify({ stage, status: updated.response?.status }));
    process.exitCode = 1;
    return;
  }
  stage = "revenuecat-readback";
  const after = await getApp({ client, path });
  assert(!after.error && after.data, "Cannot verify stored configuration");
  assert.equal(field(after.data.app_store, "bundle_id"), bundle);
  assert.equal(field(after.data.app_store, "app_store_connect_api_key_configured"), true);
  console.log(JSON.stringify({
    appleAccessVerified: true,
    correctAppleAppVerified: true,
    appStoreConnectConfigured: true,
    inAppPurchaseKeyConfigured: field(after.data.app_store, "subscription_key_configured"),
    productsChanged: false,
  }));
}

main().catch(() => {
  // Never print provider errors, request bodies, JWTs, or private-key diagnostics.
  console.error(JSON.stringify({ stage, error: "Configuration not confirmed; no sensitive details logged." }));
  process.exitCode = 1;
});
