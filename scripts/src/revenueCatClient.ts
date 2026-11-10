import { ReplitConnectors } from "@replit/connectors-sdk";
import { createClient } from "@replit/revenuecat-sdk/client";

/** Use the connected account; never persist or print its access token. */
export async function getUncachableRevenueCatClient() {
  const connectors = new ReplitConnectors();
  const proxyFetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    if (url.origin !== "https://api.revenuecat.com" || !url.pathname.startsWith("/v2/")) {
      throw new Error("Unexpected RevenueCat destination");
    }
    const headers: Record<string, string> = {};
    for (const name of ["accept", "content-type"]) {
      const value = request.headers.get(name);
      if (value) headers[name] = value;
    }
    return connectors.proxy("revenuecat", url.pathname + url.search, {
      method: request.method,
      headers,
      ...(!["GET", "HEAD"].includes(request.method) ? { body: await request.text() } : {}),
    });
  };
  return createClient({ baseUrl: "https://api.revenuecat.com/v2", fetch: proxyFetch });
}
