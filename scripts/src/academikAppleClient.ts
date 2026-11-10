import assert from "node:assert/strict";
import { createPrivateKey, sign } from "node:crypto";

/** For management scripts only. Never return or log credentials. */
export function academikAppleGet() {
  const pem = process.env.APP_STORE_CONNECT_PRIVATE_KEY?.trim().replace(/\\r\\n|\\n|\\r/g, "\n");
  const envelope = pem?.match(/^-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----$/);
  assert(envelope);
  const body = envelope[1].replace(/\s/g, "");
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
  return async function get<T>(path: string): Promise<T> {
    const url = new URL(path, "https://api.appstoreconnect.apple.com");
    assert.equal(url.origin, "https://api.appstoreconnect.apple.com");
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${jwt}` }, signal: AbortSignal.timeout(30_000),
    });
    assert(response.ok, `Apple read failed (${response.status})`);
    return response.json() as Promise<T>;
  };
}
